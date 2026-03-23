'use client'

import { useState, useEffect } from 'react'
import type { WorkoutExercise } from '@/types/view'
import WorkoutExerciseCard from '@/components/workout-session/workout-exercise-card'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'

type WorkoutExercisesListProps = {
	exercises: WorkoutExercise[]
}

export default function WorkoutExercisesList({ exercises }: WorkoutExercisesListProps) {
	const activeExercises = useWorkoutSessionStore(s => s.activeExercises)
	const initSessionExercises = useWorkoutSessionStore(s => s.initSessionExercises)

	const [openExerciseId, setOpenExerciseId] = useState<number | null>(exercises[0]?.id ?? null)

	useEffect(() => {
		initSessionExercises(exercises)
	}, [exercises, initSessionExercises])

	return (
		<div className='space-y-2 overflow-hidden'>
			{activeExercises.map(exercise => (
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
