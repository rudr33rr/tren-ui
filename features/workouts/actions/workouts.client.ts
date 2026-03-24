import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'
import type { ExerciseCardData } from '@/features/exercises/exercise.types'

type AppSupabaseClient = SupabaseClient<Database>

export async function deleteWorkout(supabase: AppSupabaseClient, workoutId: number): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) throw userError ?? new Error('User not authenticated.')

	const { data: workout, error: workoutFetchError } = await supabase
		.from('workouts')
		.select('id')
		.eq('id', workoutId)
		.eq('user_id', user.id)
		.maybeSingle()

	if (workoutFetchError) throw workoutFetchError
	if (!workout) throw new Error('Workout not found for current user.')

	const { data: sessions, error: sessionsFetchError } = await supabase
		.from('workout_session')
		.select('id')
		.eq('workout_id', workoutId)
		.eq('user_id', user.id)

	if (sessionsFetchError) throw sessionsFetchError

	const sessionIds = (sessions ?? []).map(s => s.id)

	if (sessionIds.length > 0) {
		const { data: exerciseSessions, error: exerciseSessionsFetchError } = await supabase
			.from('exercise_session')
			.select('id')
			.in('session_id', sessionIds)
			.eq('user_id', user.id)

		if (exerciseSessionsFetchError) throw exerciseSessionsFetchError

		const exerciseSessionIds = (exerciseSessions ?? []).map(es => es.id)

		if (exerciseSessionIds.length > 0) {
			const { error: exerciseSetDeleteError } = await supabase
				.from('exercise_set')
				.delete()
				.in('session_id', exerciseSessionIds)
				.eq('user_id', user.id)
			if (exerciseSetDeleteError) throw exerciseSetDeleteError
		}

		const { error: exerciseSessionDeleteError } = await supabase
			.from('exercise_session')
			.delete()
			.in('session_id', sessionIds)
			.eq('user_id', user.id)
		if (exerciseSessionDeleteError) throw exerciseSessionDeleteError
	}

	const { error: sessionsDeleteError } = await supabase
		.from('workout_session')
		.delete()
		.eq('workout_id', workoutId)
		.eq('user_id', user.id)
	if (sessionsDeleteError) throw sessionsDeleteError

	const { error: workoutExercisesDeleteError } = await supabase
		.from('workout_exercises')
		.delete()
		.eq('workout_id', workoutId)
	if (workoutExercisesDeleteError) throw workoutExercisesDeleteError

	const { error: workoutDeleteError } = await supabase
		.from('workouts')
		.delete()
		.eq('id', workoutId)
		.eq('user_id', user.id)
	if (workoutDeleteError) throw workoutDeleteError
}

export async function createWorkout(
	supabase: AppSupabaseClient,
	{ name, exercises }: { name: string; exercises: ExerciseCardData[] },
): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) throw userError ?? new Error('User not authenticated.')

	const { data: workout, error: workoutError } = await supabase
		.from('workouts')
		.insert({ name: name.trim(), user_id: user.id })
		.select('id')
		.single()

	if (workoutError || !workout) throw workoutError ?? new Error('Failed to create workout.')

	const rows = exercises.map((exercise, index) => ({
		workout_id: workout.id,
		exercise_id: exercise.id,
		exercise_order: index + 1,
	}))

	const { error: exercisesError } = await supabase.from('workout_exercises').insert(rows)
	if (exercisesError) {
		await supabase.from('workouts').delete().eq('id', workout.id).eq('user_id', user.id)
		throw exercisesError
	}
}

export async function updateWorkout(
	supabase: AppSupabaseClient,
	{ workoutId, name, description }: { workoutId: number; name: string; description: string },
): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) throw userError ?? new Error('User not authenticated.')

	const { error } = await supabase
		.from('workouts')
		.update({
			name: name.trim(),
			description: description.trim().length > 0 ? description.trim() : null,
		})
		.eq('id', workoutId)
		.eq('user_id', user.id)

	if (error) throw error
}
