import { eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import { workouts } from '@/db/schema'
import type { WorkoutCardData } from '@/types/workout.types'

const PAGE_SIZE = 20

export async function fetchInitialWorkouts(userId: string, page = 0): Promise<WorkoutCardData[]> {
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
		description: w.description,
		exerciseCount: w.exercises.length,
	}))
}
