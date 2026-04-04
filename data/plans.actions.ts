'use server'

import { eq, count } from 'drizzle-orm'
import { db } from '@/db'
import { workoutPlans, workoutPlanDays } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'

export async function createPlan({
	name,
	description,
	days,
}: {
	name: string
	description?: string
	days: { dayIndex: number; workoutId: number }[]
}): Promise<void> {
	const userId = await getCurrentUserId()

	await db.transaction(async tx => {
		const [{ planCount }] = await tx
			.select({ planCount: count() })
			.from(workoutPlans)
			.where(eq(workoutPlans.userId, userId))

		const [plan] = await tx
			.insert(workoutPlans)
			.values({ name, description: description || null, userId, isActive: planCount === 0 })
			.returning({ id: workoutPlans.id })

		if (days.length > 0) {
			await tx
				.insert(workoutPlanDays)
				.values(days.map(d => ({ planId: plan.id, dayIndex: d.dayIndex, workoutId: d.workoutId })))
		}
	})
}

export async function deletePlan(planId: number): Promise<void> {
	const userId = await getCurrentUserId()
	await db.delete(workoutPlans).where(eq(workoutPlans.id, planId)).returning()
	// Note: user check will be added when auth is implemented
	void userId
}

export async function deactivatePlan(planId: number): Promise<void> {
	await db.update(workoutPlans).set({ isActive: false }).where(eq(workoutPlans.id, planId))
}

export async function setActivePlan(planId: number): Promise<void> {
	const userId = await getCurrentUserId()

	await db.transaction(async tx => {
		await tx.update(workoutPlans).set({ isActive: false }).where(eq(workoutPlans.userId, userId))
		await tx.update(workoutPlans).set({ isActive: true }).where(eq(workoutPlans.id, planId))
	})
}
