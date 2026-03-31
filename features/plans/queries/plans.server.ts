import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type AppSupabaseClient = SupabaseClient<Database>

export type PlanDay = {
	id: number
	dayIndex: number
	workoutId: number
	workoutName: string
	exerciseCount: number
}

export type PlanWithDays = {
	id: number
	name: string
	description: string | null
	isActive: boolean
	createdAt: string
	days: PlanDay[]
}

type RawPlanDay = {
	id: number
	day_index: number
	workout_id: number
	workouts: { name: string; workout_exercises: { id: number }[] } | null
}

type RawPlan = {
	id: number
	name: string
	description: string | null
	is_active: boolean
	created_at: string
	workout_plan_days: RawPlanDay[]
}

function transformPlan(raw: RawPlan): PlanWithDays {
	return {
		id: raw.id,
		name: raw.name,
		description: raw.description,
		isActive: raw.is_active,
		createdAt: raw.created_at,
		days: (raw.workout_plan_days ?? []).map(d => ({
			id: d.id,
			dayIndex: d.day_index,
			workoutId: d.workout_id,
			workoutName: d.workouts?.name ?? '',
			exerciseCount: d.workouts?.workout_exercises?.length ?? 0,
		})),
	}
}

const PLAN_SELECT = `
  id, name, description, is_active, created_at,
  workout_plan_days (
    id, day_index, workout_id,
    workouts ( name, workout_exercises(id) )
  )
` as const

export async function fetchPlans(supabase: AppSupabaseClient, userId: string): Promise<PlanWithDays[]> {
	const { data, error } = await supabase
		.from('workout_plans')
		.select(PLAN_SELECT)
		.eq('user_id', userId)
		.order('is_active', { ascending: false })
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data as unknown as RawPlan[]).map(transformPlan)
}

export async function fetchActivePlan(
	supabase: AppSupabaseClient,
	userId: string,
): Promise<PlanWithDays | null> {
	const { data, error } = await supabase
		.from('workout_plans')
		.select(PLAN_SELECT)
		.eq('user_id', userId)
		.eq('is_active', true)
		.maybeSingle()

	if (error) throw error
	if (!data) return null

	return transformPlan(data as unknown as RawPlan)
}
