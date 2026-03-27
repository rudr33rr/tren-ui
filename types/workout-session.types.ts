import type { ExerciseCardData } from '@/types/exercise.types'

export type WorkoutExercise = Pick<ExerciseCardData, 'id' | 'name'>
