import type { exercises, muscleGroups, workouts } from '@/lib/db/schema'

// Drizzle inferred row types
type ExerciseRow = typeof exercises.$inferSelect
type MuscleRow = typeof muscleGroups.$inferSelect
type WorkoutRow = typeof workouts.$inferSelect

export type DifficultyLevel = ExerciseRow['difficulty']
export type WorkoutTag = NonNullable<WorkoutRow['tag']>
export type SessionStatus = 'completed' | 'started' | 'cancelled'

export type ExerciseCardData = {
	id: ExerciseRow['id']
	name: ExerciseRow['exerciseName']
	difficulty: ExerciseRow['difficulty']
	primaryMuscle: { id: MuscleRow['id']; name: MuscleRow['name'] } | null
	secondaryMuscles: { id: MuscleRow['id']; name: MuscleRow['name'] }[]
}

export type ExercisePageData = ExerciseCardData & {
	instructions: string[]
}

export type WorkoutCardData = {
	id: WorkoutRow['id']
	name: WorkoutRow['name']
	description: WorkoutRow['description']
	tag: WorkoutRow['tag']
	exerciseCount: number
}
