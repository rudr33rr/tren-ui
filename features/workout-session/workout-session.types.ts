import type { ExerciseCardData } from '@/features/exercises/exercise.types'

export type WorkoutExercise = Pick<ExerciseCardData, 'id' | 'name'>
