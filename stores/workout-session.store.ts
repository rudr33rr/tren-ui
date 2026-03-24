import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkoutExercise } from '@/features/workout-session/workout-session.types'

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
	activeExercises: WorkoutExercise[]
	exercises: Record<number, ExerciseState>

	startWorkout: (workoutId: number) => void
	setActiveWorkout: (workoutId: number) => void
	initSessionExercises: (exercises: WorkoutExercise[]) => void
	addSessionExercise: (exercise: WorkoutExercise) => void
	removeSessionExercise: (exerciseId: number) => void
	upsertExercise: (exercise: ExerciseState) => void
	clear: () => void
}

type PersistedWorkoutSessionState = Pick<WorkoutSessionState, 'activeWorkoutId' | 'activeExercises' | 'exercises'>

export const useWorkoutSessionStore = create<WorkoutSessionState>()(
	persist(
		set => ({
			activeWorkoutId: null,
			activeExercises: [],
			exercises: {},

			startWorkout: workoutId =>
				set({
					activeWorkoutId: workoutId,
					activeExercises: [],
					exercises: {},
				}),

			setActiveWorkout: workoutId =>
				set(state => {
					if (state.activeWorkoutId === workoutId) return state

					return {
						activeWorkoutId: workoutId,
						activeExercises: [],
						exercises: {},
					}
				}),

			initSessionExercises: exercises =>
				set(state => {
					if (state.activeExercises.length > 0) return state
					return { activeExercises: exercises }
				}),

			addSessionExercise: exercise =>
				set(state => {
					if (state.activeExercises.some(e => e.id === exercise.id)) return state
					return { activeExercises: [...state.activeExercises, exercise] }
				}),

			removeSessionExercise: exerciseId =>
				set(state => {
					const nextExercises = { ...state.exercises }
					delete nextExercises[exerciseId]
					return {
						activeExercises: state.activeExercises.filter(e => e.id !== exerciseId),
						exercises: nextExercises,
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
					activeExercises: [],
					exercises: {},
				}),
		}),
		{
			name: 'workout-session-store',
			version: 2,
			migrate: persistedState => {
				const state = persistedState as Partial<PersistedWorkoutSessionState> | undefined

				if (typeof state?.activeWorkoutId === 'number') {
					return {
						activeWorkoutId: state.activeWorkoutId,
						activeExercises: state.activeExercises ?? [],
						exercises: state.exercises ?? {},
					}
				}

				return {
					activeWorkoutId: null,
					activeExercises: [],
					exercises: {},
				}
			},
			partialize: state => ({
				activeWorkoutId: state.activeWorkoutId,
				activeExercises: state.activeExercises,
				exercises: state.exercises,
			}),
		},
	),
)
