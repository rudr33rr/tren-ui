import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SetEntry = {
	reps: number
	weight?: number
	intensity?: number
	completed?: boolean
}

type ExerciseState = {
	exerciseId: number
	sets: SetEntry[]
	intensity?: number
	notes?: string
}

type WorkoutSessionState = {
	activeWorkoutId: number | null
	exercises: Record<number, ExerciseState>

	startWorkout: (workoutId: number) => void
	setActiveWorkout: (workoutId: number) => void
	upsertExercise: (exercise: ExerciseState) => void
	clear: () => void
}

type PersistedWorkoutSessionState = Pick<WorkoutSessionState, 'activeWorkoutId' | 'exercises'>

export const useWorkoutSessionStore = create<WorkoutSessionState>()(
	persist(
		set => ({
			activeWorkoutId: null,
			exercises: {},

			startWorkout: workoutId =>
				set({
					activeWorkoutId: workoutId,
					exercises: {},
				}),

			setActiveWorkout: workoutId =>
				set(state => {
					if (state.activeWorkoutId === workoutId) {
						return state
					}

					return {
						activeWorkoutId: workoutId,
						exercises: {},
					}
				}),

			upsertExercise: exercise =>
				set(state => ({
					exercises: {
						...state.exercises,
						[exercise.exerciseId]: exercise,
					},
				})),

			clear: () =>
				set({
					activeWorkoutId: null,
					exercises: {},
				}),
		}),
		{
			name: 'workout-session-store',
			version: 1,
			migrate: persistedState => {
				const state = persistedState as Partial<PersistedWorkoutSessionState> | undefined

				if (typeof state?.activeWorkoutId === 'number') {
					return {
						activeWorkoutId: state.activeWorkoutId,
						exercises: state.exercises ?? {},
					}
				}

				return {
					activeWorkoutId: null,
					exercises: {},
				}
			},
			partialize: state => ({
				activeWorkoutId: state.activeWorkoutId,
				exercises: state.exercises,
			}),
		},
	),
)
