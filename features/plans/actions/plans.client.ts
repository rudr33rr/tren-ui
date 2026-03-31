import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type AppSupabaseClient = SupabaseClient<Database>

export async function createPlan(
	supabase: AppSupabaseClient,
	{
		name,
		description,
		days,
	}: {
		name: string
		description?: string
		days: { dayIndex: number; workoutId: number }[]
	},
): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) throw userError ?? new Error('User not authenticated.')

	const { count } = await supabase
		.from('workout_plans')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', user.id)

	const { data: plan, error: planError } = await supabase
		.from('workout_plans')
		.insert({ name, description: description || null, user_id: user.id, is_active: count === 0 })
		.select('id')
		.single()

	if (planError || !plan) throw planError ?? new Error('Failed to create plan.')

	if (days.length > 0) {
		const rows = days.map(d => ({ plan_id: plan.id, day_index: d.dayIndex, workout_id: d.workoutId }))
		const { error: daysError } = await supabase.from('workout_plan_days').insert(rows)

		if (daysError) {
			await supabase.from('workout_plans').delete().eq('id', plan.id)
			throw daysError
		}
	}
}

export async function deletePlan(supabase: AppSupabaseClient, planId: number): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) throw userError ?? new Error('User not authenticated.')

	const { error } = await supabase.from('workout_plans').delete().eq('id', planId).eq('user_id', user.id)

	if (error) throw error
}

export async function deactivatePlan(supabase: AppSupabaseClient, planId: number): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) throw userError ?? new Error('User not authenticated.')

	const { error } = await supabase
		.from('workout_plans')
		.update({ is_active: false })
		.eq('id', planId)
		.eq('user_id', user.id)

	if (error) throw error
}

export async function setActivePlan(supabase: AppSupabaseClient, planId: number): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) throw userError ?? new Error('User not authenticated.')

	// Deactivate all first — required to avoid partial unique index violation
	const { error: deactivateError } = await supabase
		.from('workout_plans')
		.update({ is_active: false })
		.eq('user_id', user.id)

	if (deactivateError) throw deactivateError

	const { error: activateError } = await supabase
		.from('workout_plans')
		.update({ is_active: true })
		.eq('id', planId)
		.eq('user_id', user.id)

	if (activateError) throw activateError
}
