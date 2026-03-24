import type { Tables, Enums } from '@/types/database.types'

type ExerciseRow = Tables<'exercises'>
type MuscleRow = Tables<'muscle_groups'>

export type ExerciseType = NonNullable<Enums<'exercise_type'>>

export type MuscleGroup = {
	id: MuscleRow['id']
	name: MuscleRow['name']
}

export type ExerciseCardData = {
	id: ExerciseRow['id']
	name: ExerciseRow['exercise_name']
	primaryMuscle: MuscleGroup | null
	secondaryMuscles: MuscleGroup[]
	type: ExerciseType | null
}

export type ExercisePageData = ExerciseCardData & {
	instructions: string[]
}
