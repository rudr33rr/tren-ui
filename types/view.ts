import type { difficultyLevelEnum, exercises, muscleGroups, workoutTagEnum, workouts } from '@/lib/db/schema'

// Drizzle inferred row types
type ExerciseRow = typeof exercises.$inferSelect
type MuscleRow = typeof muscleGroups.$inferSelect
type WorkoutRow = typeof workouts.$inferSelect

export type DifficultyLevel = (typeof difficultyLevelEnum.enumValues)[number]
export type WorkoutTag = (typeof workoutTagEnum.enumValues)[number]

export type MuscleOption = {
	id: MuscleRow['id']
	name: MuscleRow['name']
}

export type ExerciseOption = {
	id: ExerciseRow['id']
	name: ExerciseRow['exerciseName']
}

export type ExerciseCardData = {
	id: ExerciseRow['id']
	name: ExerciseRow['exerciseName']
	difficulty: ExerciseRow['difficulty']
	primaryMuscle: MuscleOption | null
	secondaryMuscles: MuscleOption[]
}

export type ExerciseSessionSetData = {
	setNumber: number
	repetitions: number
	weight: number | null
	intensity: number | null
}

export type ExerciseSessionHistoryItem = {
	sessionId: number
	workoutId: WorkoutRow['id']
	workoutName: WorkoutRow['name']
	finishedAt: Date | null
	duration: number | null
	notes: string | null
	totalRepetitions: number
	maxWeight: number | null
	sets: ExerciseSessionSetData[]
}

export type ExercisePageData = ExerciseCardData & {
	instructions: string[]
	sessions: ExerciseSessionHistoryItem[]
}

export type WorkoutCardData = {
	id: WorkoutRow['id']
	name: WorkoutRow['name']
	description: WorkoutRow['description']
	tag: WorkoutRow['tag']
	exerciseCount: number
}
