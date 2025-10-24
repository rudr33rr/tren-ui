import type { Tables, Enums } from './supabase'

type ExerciseRow = Tables<'exercises'>
type MuscleRow = Tables<'muscle_groups'>

export type ExerciseCardData = {
	id: ExerciseRow['id']
	name: ExerciseRow['exercise_name']
	difficulty: Enums<'difficulty_level'>
	primaryMuscle: { id: MuscleRow['id']; name: MuscleRow['name'] } | null
	secondaryMuscles: { id: MuscleRow['id']; name: MuscleRow['name'] }[]
}
