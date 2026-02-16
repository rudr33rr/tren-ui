import { create } from 'zustand'

type SetEntry = {
	reps: number
	weight?: number
	intensity?: number
}

type ExerciseState = {
	exerciseId: number
	sets: SetEntry[]
	intensity?: number
	notes?: string
}

type WorkoutSessionState = {
	exercises: Record<number, ExerciseState>

	upsertExercise: (exercise: ExerciseState) => void
	clear: () => void
}

export const useWorkoutSessionStore = create<WorkoutSessionState>(set => ({
	exercises: {},

	upsertExercise: exercise =>
		set(state => ({
			exercises: {
				...state.exercises,
				[exercise.exerciseId]: exercise,
			},
		})),

	clear: () => set({ exercises: {} }),
}))
