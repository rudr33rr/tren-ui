'use server'

import { eq, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { workoutPlans, workoutPlanDays } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'

export async function updatePlan({
	planId,
	name,
	days,
}: {
	planId: number
	name: string
	days: { dayIndex: number; workoutId: number }[]
}): Promise<void> {
	const userId = await getCurrentUserId()

	await db.transaction(async tx => {
		const plan = await tx.query.workoutPlans.findFirst({
			where: (wp, { and }) => and(eq(wp.id, planId), eq(wp.userId, userId)),
			columns: { id: true },
		})
		if (!plan) throw new Error('Plan not found.')

		await tx.update(workoutPlans).set({ name: name.trim() }).where(eq(workoutPlans.id, planId))
		await tx.delete(workoutPlanDays).where(eq(workoutPlanDays.planId, planId))

		if (days.length > 0) {
			await tx.insert(workoutPlanDays).values(
				days.map(d => ({ planId, dayIndex: d.dayIndex, workoutId: d.workoutId })),
			)
		}
	})
	revalidatePath('/dashboard/plans')
}

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
	revalidatePath('/dashboard/plans')
}

export async function deletePlan(planId: number): Promise<void> {
	const userId = await getCurrentUserId()
	await db.delete(workoutPlans).where(eq(workoutPlans.id, planId) && eq(workoutPlans.userId, userId))
	revalidatePath('/dashboard/plans')
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
