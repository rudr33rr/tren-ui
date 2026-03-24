'use client'

import { ExerciseCard } from '@/features/exercises/components/exercise-card'
import { useCreateWorkoutStore } from '@/stores/create-workout.store'
import type { ExerciseCardData } from '@/features/exercises/exercise.types'

type Props = {
	exercises: ExerciseCardData[]
}

export function AddWorkoutExercisesGrid({ exercises }: Props) {
	const selectedExercises = useCreateWorkoutStore(state => state.exercises)
	const addExercise = useCreateWorkoutStore(state => state.addExercise)
	const removeExercise = useCreateWorkoutStore(state => state.removeExercise)

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2'>
			{exercises.map(exercise => {
				const isSelected = Boolean(selectedExercises[exercise.id])

				return (
					<button
						key={exercise.id}
						type='button'
						onClick={() => {
							if (isSelected) {
								removeExercise(exercise.id)
								return
							}

							addExercise(exercise)
						}}
						aria-pressed={isSelected}
						className='text-left rounded-xl'>
						<ExerciseCard exercise={exercise} variant='workout' selected={isSelected} />
					</button>
				)
			})}
		</div>
	)
}
