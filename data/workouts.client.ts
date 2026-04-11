'use server'

import { eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import { workouts } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'
import type { WorkoutCardData } from '@/types/workout.types'

const PAGE_SIZE = 20

export async function fetchWorkoutsPage(page: number): Promise<WorkoutCardData[]> {
	const userId = await getCurrentUserId()

	const data = await db.query.workouts.findMany({
		where: eq(workouts.userId, userId),
		with: { exercises: { columns: { id: true } } },
		orderBy: [asc(workouts.id)],
		limit: PAGE_SIZE,
		offset: page * PAGE_SIZE,
	})

	return data.map(w => ({
		id: w.id,
		name: w.name,
		exerciseCount: w.exercises.length,
	}))
}
