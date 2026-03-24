import { create } from 'zustand'
import type { ExerciseCardData } from '@/types/view'

type CreateWorkoutState = {
	name: string
	exercises: Record<number, ExerciseCardData>
	exerciseOrder: number[]

	setName: (name: string) => void
	addExercise: (exercise: ExerciseCardData) => void
	removeExercise: (exerciseId: number) => void
	reorderExercises: (activeExerciseId: number, overExerciseId: number) => void
	clear: () => void
}

export const useCreateWorkoutStore = create<CreateWorkoutState>(set => ({
	name: '',
	exercises: {},
	exerciseOrder: [],

	setName: name => set({ name }),

	addExercise: exercise =>
		set(state => {
			if (state.exercises[exercise.id]) {
				return state
			}

			return {
				exercises: {
					...state.exercises,
					[exercise.id]: exercise,
				},
				exerciseOrder: [...state.exerciseOrder, exercise.id],
			}
		}),

	removeExercise: exerciseId =>
		set(state => {
			const nextExercises = { ...state.exercises }
			delete nextExercises[exerciseId]

			return {
				exercises: nextExercises,
				exerciseOrder: state.exerciseOrder.filter(id => id !== exerciseId),
			}
		}),

	reorderExercises: (activeExerciseId, overExerciseId) =>
		set(state => {
			const oldIndex = state.exerciseOrder.indexOf(activeExerciseId)
			const newIndex = state.exerciseOrder.indexOf(overExerciseId)

			if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
				return state
			}

			const nextOrder = [...state.exerciseOrder]
			const [movedExerciseId] = nextOrder.splice(oldIndex, 1)
			nextOrder.splice(newIndex, 0, movedExerciseId)

			return { exerciseOrder: nextOrder }
		}),

	clear: () => set({ name: '', exercises: {}, exerciseOrder: [] }),
}))
