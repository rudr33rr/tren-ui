'use client'

import { ExerciseCard } from '@/features/exercises/components/exercise-card'
import { useWorkoutSessionStore } from '@/stores/workout-session.store'
import type { ExerciseCardData } from '@/features/exercises/exercise.types'

type Props = {
	exercises: ExerciseCardData[]
	onSelect: () => void
}

export function AddSessionExercisesGrid({ exercises, onSelect }: Props) {
	const activeExercises = useWorkoutSessionStore(s => s.activeExercises)
	const addSessionExercise = useWorkoutSessionStore(s => s.addSessionExercise)

	const activeIds = new Set(activeExercises.map(e => e.id))
	const available = exercises.filter(e => !activeIds.has(e.id))

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 mb-8'>
			{available.map(exercise => (
				<button
					key={exercise.id}
					type='button'
					onClick={() => { addSessionExercise({ id: exercise.id, name: exercise.name }); onSelect() }}
					className='text-left rounded-xl'>
					<ExerciseCard exercise={exercise} variant='workout' selected={false} />
				</button>
			))}
		</div>
	)
}
