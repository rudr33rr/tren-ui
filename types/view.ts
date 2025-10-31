import type { Tables, Enums } from './supabase'

type ExerciseRow = Tables<'exercises'>
type MuscleRow = Tables<'muscle_groups'>
type WorkoutRow = Tables<'workouts'>

export type ExerciseCardData = {
	id: ExerciseRow['id']
	name: ExerciseRow['exercise_name']
	difficulty: Enums<'difficulty_level'>
	primaryMuscle: { id: MuscleRow['id']; name: MuscleRow['name'] } | null
	secondaryMuscles: { id: MuscleRow['id']; name: MuscleRow['name'] }[]
}

export type ExercisePageData = {
	id: ExerciseRow['id']
	name: ExerciseRow['exercise_name']
	difficulty: Enums<'difficulty_level'>
	primaryMuscle: { id: MuscleRow['id']; name: MuscleRow['name'] } | null
	secondaryMuscles: { id: MuscleRow['id']; name: MuscleRow['name'] }[]
	instructions: string[]
}

export type WorkoutCardData = {
	id: WorkoutRow['id']
	name: WorkoutRow['name']
	description: WorkoutRow['description']
	tag: WorkoutRow['tag']
	duration: WorkoutRow['duration']
	exerciseCount: number
}
