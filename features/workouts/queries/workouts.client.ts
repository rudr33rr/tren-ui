import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'
import type { WorkoutCardData } from '../workout.types'

type AppSupabaseClient = SupabaseClient<Database>

const PAGE_SIZE = 20

export async function fetchWorkoutsPage(
	supabase: AppSupabaseClient,
	userId: string,
	page: number,
): Promise<WorkoutCardData[]> {
	const from = page * PAGE_SIZE
	const to = from + PAGE_SIZE - 1

	const { data, error } = await supabase
		.from('workouts')
		.select('id, name, description, workout_exercises(id)')
		.eq('user_id', userId)
		.order('id', { ascending: true })
		.range(from, to)

	if (error) throw error

	return (data ?? []).map(w => ({
		id: w.id,
		name: w.name,
		description: w.description,
		exerciseCount: Array.isArray(w.workout_exercises) ? w.workout_exercises.length : 0,
	}))
}
