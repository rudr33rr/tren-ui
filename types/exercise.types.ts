import type {
	exercises,
	muscleGroups,
	exerciseTypeEnum,
	exerciseTrackingTypeEnum,
	exerciseWeightTypeEnum,
} from '@/db/schema'

type ExerciseRow = typeof exercises.$inferSelect
type MuscleRow = typeof muscleGroups.$inferSelect

export type ExerciseType = (typeof exerciseTypeEnum.enumValues)[number]
export type ExerciseTrackingType = (typeof exerciseTrackingTypeEnum.enumValues)[number]
export type ExerciseWeightType = (typeof exerciseWeightTypeEnum.enumValues)[number]

export type MuscleGroup = {
	id: MuscleRow['id']
	name: MuscleRow['name']
}

export type ExerciseCardData = {
	id: ExerciseRow['id']
	name: ExerciseRow['exerciseName']
	primaryMuscle: MuscleGroup | null
	secondaryMuscles: MuscleGroup[]
	type: ExerciseType | null
	trackingType: ExerciseTrackingType
	weightType: ExerciseWeightType
	isUnilateral: ExerciseRow['isUnilateral']
}

export type ExercisePageData = ExerciseCardData & {
	instructions: string[]
}
