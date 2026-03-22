'use client'

import { useState } from 'react'
import type { WorkoutExercise } from '@/types/view'
import WorkoutExerciseCard from '@/components/workout-session/workout-exercise-card'

type WorkoutExercisesListProps = {
	exercises: WorkoutExercise[]
}

export default function WorkoutExercisesList({ exercises }: WorkoutExercisesListProps) {
	const [openExerciseId, setOpenExerciseId] = useState<number | null>(exercises[0]?.id ?? null)

	return (
		<div className='space-y-2 overflow-hidden'>
			{exercises.map(exercise => (
				<WorkoutExerciseCard
					key={exercise.id}
					exercise={exercise}
					isOpen={openExerciseId === exercise.id}
					onOpenChange={isOpen => setOpenExerciseId(isOpen ? exercise.id : null)}
				/>
			))}
		</div>
	)
}
