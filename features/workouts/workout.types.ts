import type { Tables } from '@/types/database.types'

type WorkoutRow = Tables<'workouts'>

export type WorkoutCardData = {
	id: WorkoutRow['id']
	name: WorkoutRow['name']
	description: WorkoutRow['description']
	exerciseCount: number
}
