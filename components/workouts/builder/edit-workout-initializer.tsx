'use client'

import { useEffect, useRef } from 'react'
import { useCreateWorkoutStore } from '@/stores/create-workout.store'
import type { ExerciseCardData } from '@/types/exercise.types'

type Props = {
	name: string
	exercises: ExerciseCardData[]
}

export function EditWorkoutInitializer({ name, exercises }: Props) {
	const clear = useCreateWorkoutStore(state => state.clear)
	const setName = useCreateWorkoutStore(state => state.setName)
	const addExercise = useCreateWorkoutStore(state => state.addExercise)

	const initialName = useRef(name)
	const initialExercises = useRef(exercises)

	useEffect(() => {
		clear()
		setName(initialName.current)
		initialExercises.current.forEach(ex => addExercise(ex))
	}, [clear, setName, addExercise])

	return null
}
