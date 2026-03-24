import type { SupabaseClient } from '@supabase/supabase-js'

import { isExerciseType } from '@/lib/exerciseTypeIcons'
import type { Database } from '@/types/database.types'
import type { ExerciseCardData } from '../exercise.types'

type AppSupabaseClient = SupabaseClient<Database>

const PAGE_SIZE = 20

export type ExerciseFilters = {
	search?: string
	muscle?: string
	type?: string
}

export async function fetchExercisesPage(
	supabase: AppSupabaseClient,
	page: number,
	filters: ExerciseFilters = {},
): Promise<ExerciseCardData[]> {
	const { search, muscle, type } = filters
	const from = page * PAGE_SIZE
	const to = from + PAGE_SIZE - 1

	let query = supabase.from('exercises').select(`
		id,
		exercise_name,
		primaryMuscle:muscle_groups!exercises_primary_muscle_id_fkey ( id, name ),
		type
	`)

	if (search) query = query.ilike('exercise_name', `%${search}%`)
	if (muscle) query = query.eq('primary_muscle_id', Number(muscle))
	if (type && isExerciseType(type)) query = query.eq('type', type)

	const { data, error } = await query.order('id', { ascending: true }).range(from, to)

	if (error) throw error

	return (data ?? []).map(item => {
		const primary = Array.isArray(item.primaryMuscle) ? (item.primaryMuscle[0] ?? null) : (item.primaryMuscle ?? null)

		return {
			id: item.id,
			name: item.exercise_name,
			primaryMuscle: primary ? { id: primary.id, name: primary.name } : null,
			secondaryMuscles: [],
			type: item.type,
		}
	})
}
