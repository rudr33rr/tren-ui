import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

type AppSupabaseClient = SupabaseClient<Database>

type SetEntry = {
	reps: number
	weight?: number
	intensity?: number
}

type ExerciseState = {
	exerciseId: number
	sets: SetEntry[]
	notes?: string
}

export async function saveSession(
	supabase: AppSupabaseClient,
	{ workoutId, exercises }: { workoutId: number; exercises: ExerciseState[] },
): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) throw userError ?? new Error('User not authenticated')

	const { data: createdSession, error: sessionError } = await supabase
		.from('workout_session')
		.insert({ workout_id: workoutId, user_id: user.id })
		.select('id')
		.single()

	if (sessionError || !createdSession) throw sessionError ?? new Error('Failed to create workout session')

	if (exercises.length > 0) {
		const exerciseRows = exercises.map(exercise => ({
			session_id: createdSession.id,
			exercise_id: exercise.exerciseId,
			notes: exercise.notes ?? null,
			user_id: user.id,
		}))

		const { data: insertedExerciseSessions, error: exerciseSessionError } = await supabase
			.from('exercise_session')
			.insert(exerciseRows)
			.select('id, exercise_id')

		if (exerciseSessionError) throw exerciseSessionError

		const exercisesById = new Map(exercises.map(e => [e.exerciseId, e]))

		const setRows = (insertedExerciseSessions ?? []).flatMap(insertedSession => {
			const exercise = exercisesById.get(insertedSession.exercise_id)
			if (!exercise) return []

			return exercise.sets.map(set => ({
				session_id: insertedSession.id,
				reps: set.reps,
				weight: set.weight ?? null,
				intensity: set.intensity ?? null,
				user_id: user.id,
			}))
		})

		if (setRows.length > 0) {
			const { error: exerciseSetError } = await supabase.from('exercise_set').insert(setRows)
			if (exerciseSetError) throw exerciseSetError
		}
	}
}
