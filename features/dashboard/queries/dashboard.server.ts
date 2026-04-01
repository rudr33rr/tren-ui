import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type AppSupabaseClient = SupabaseClient<Database>

export type DashboardStats = {
	totalSessions: number
	thisWeekSessions: number
	thisMonthSessions: number
}

export async function fetchDashboardStats(supabase: AppSupabaseClient, userId: string): Promise<DashboardStats> {
	const now = new Date()

	const weekStart = new Date(now)
	weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
	weekStart.setHours(0, 0, 0, 0)

	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

	const [totalResult, weekResult, monthResult] = await Promise.all([
		supabase.from('workout_session').select('*', { count: 'exact', head: true }).eq('user_id', userId),
		supabase
			.from('workout_session')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', userId)
			.gte('created_at', weekStart.toISOString()),
		supabase
			.from('workout_session')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', userId)
			.gte('created_at', monthStart.toISOString()),
	])

	return {
		totalSessions: totalResult.count ?? 0,
		thisWeekSessions: weekResult.count ?? 0,
		thisMonthSessions: monthResult.count ?? 0,
	}
}
