'use client'

import { useState, useEffect } from 'react'
import type { WorkoutExercise, ExerciseCardData, MuscleGroup } from '@/types/view'
import WorkoutExerciseCard from '@/components/workout-session/workout-exercise-card'
import AddExerciseDrawer from '@/components/workout-session/add-exercise-drawer'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'

type WorkoutExercisesListProps = {
	exercises: WorkoutExercise[]
	availableExercises: ExerciseCardData[]
	muscles: MuscleGroup[]
	musclesError: boolean
	exercisesErrorMessage?: string
}

export default function WorkoutExercisesList({
	exercises,
	availableExercises,
	muscles,
	musclesError,
	exercisesErrorMessage,
}: WorkoutExercisesListProps) {
	const activeExercises = useWorkoutSessionStore(s => s.activeExercises)
	const initSessionExercises = useWorkoutSessionStore(s => s.initSessionExercises)

	const [openExerciseId, setOpenExerciseId] = useState<number | null>(null)

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
			<AddExerciseDrawer
				exercises={availableExercises}
				muscles={muscles}
				musclesError={musclesError}
				exercisesErrorMessage={exercisesErrorMessage}
			/>
		</div>
	)
}
