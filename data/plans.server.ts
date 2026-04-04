import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { workoutPlans } from '@/db/schema'

export type PlanDay = {
	id: number
	dayIndex: number
	workoutId: number
	workoutName: string
	exerciseCount: number
}

export type PlanWithDays = {
	id: number
	name: string
	description: string | null
	isActive: boolean
	createdAt: string
	days: PlanDay[]
}

function transformPlan(raw: Awaited<ReturnType<typeof queryPlans>>[number]): PlanWithDays {
	return {
		id: raw.id,
		name: raw.name,
		description: raw.description,
		isActive: raw.isActive,
		createdAt: raw.createdAt?.toISOString() ?? '',
		days: raw.days.map(d => ({
			id: d.id,
			dayIndex: d.dayIndex,
			workoutId: d.workoutId,
			workoutName: d.workout?.name ?? '',
			exerciseCount: d.workout?.exercises?.length ?? 0,
		})),
	}
}

function queryPlans(userId: string) {
	return db.query.workoutPlans.findMany({
		where: eq(workoutPlans.userId, userId),
		orderBy: [desc(workoutPlans.isActive), desc(workoutPlans.createdAt)],
		with: {
			days: {
				with: {
					workout: {
						with: {
							exercises: { columns: { id: true } },
						},
					},
				},
			},
		},
	})
}

export async function fetchPlans(userId: string): Promise<PlanWithDays[]> {
	const data = await queryPlans(userId)
	return data.map(transformPlan)
}

export async function fetchActivePlan(userId: string): Promise<PlanWithDays | null> {
	const data = await db.query.workoutPlans.findFirst({
		where: (wp, { and }) => and(eq(wp.userId, userId), eq(wp.isActive, true)),
		with: {
			days: {
				with: {
					workout: {
						with: {
							exercises: { columns: { id: true } },
						},
					},
				},
			},
		},
	})

	if (!data) return null
	return transformPlan(data)
}
