import type { Tables, Enums } from './supabase'

type ExerciseRow = Tables<'exercises'>
type MuscleRow = Tables<'muscle_groups'>
type WorkoutRow = Tables<'workouts'>

export type MuscleGroup = {
	id: MuscleRow['id']
	name: MuscleRow['name']
}

export type ExerciseCardData = {
	id: ExerciseRow['id']
	name: ExerciseRow['exercise_name']
	difficulty: Enums<'difficulty_level'>
	primaryMuscle: MuscleGroup | null
	secondaryMuscles: MuscleGroup[]
	type: Enums<'exercise_type'> | null
}

export type ExercisePageData = ExerciseCardData & {
	instructions: string[]
}

export type WorkoutCardData = {
	id: WorkoutRow['id']
	name: WorkoutRow['name']
	description: WorkoutRow['description']
	duration: WorkoutRow['duration']
	exerciseCount: number
}

export type WorkoutExercise = Pick<ExerciseCardData, 'id' | 'name' | 'difficulty'>
