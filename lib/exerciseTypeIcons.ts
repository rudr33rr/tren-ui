import { CircleDotDashed, Dumbbell, Heart, PersonStanding, Sword, type LucideIcon } from 'lucide-react'
import type { ExerciseType } from '@/features/exercises/exercise.types'

export type ExerciseTypeMeta = {
	label: string
	icon: LucideIcon
}

export const exerciseTypeConfig = {
	strength: {
		label: 'Strength',
		icon: Dumbbell,
	},
	cardio: {
		label: 'Cardio',
		icon: Heart,
	},
	flexibility: {
		label: 'Flexibility',
		icon: PersonStanding,
	},
	core: {
		label: 'Core',
		icon: CircleDotDashed,
	},
	plyometric: {
		label: 'Plyometric',
		icon: Sword,
	},
} satisfies Record<ExerciseType, ExerciseTypeMeta>

export const exerciseTypes = Object.keys(exerciseTypeConfig) as ExerciseType[]

export function isExerciseType(value: string): value is ExerciseType {
	return Object.prototype.hasOwnProperty.call(exerciseTypeConfig, value)
}
