import type { workouts } from '@/db/schema'

type WorkoutRow = typeof workouts.$inferSelect

export type WorkoutCardData = {
	id: WorkoutRow['id']
	name: WorkoutRow['name']
	exerciseCount: number
}
