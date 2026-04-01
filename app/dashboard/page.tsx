import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchActivePlan } from '@/features/plans/queries/plans.server'
import { fetchDashboardStats } from '@/features/dashboard/queries/dashboard.server'
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats'
import { TodayWorkout } from '@/features/dashboard/components/today-workout'

export default async function DashboardPage() {
	const supabase = await createClient()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()
	if (error || !user) redirect('/auth/login')

	const [stats, activePlan] = await Promise.all([
		fetchDashboardStats(supabase, user.id),
		fetchActivePlan(supabase, user.id),
	])

	let todayWorkoutSessionId: number | null = null
	if (activePlan) {
		const todayDayIndex = (new Date().getDay() + 6) % 7
		const todayPlanDay = activePlan.days.find(d => d.dayIndex === todayDayIndex)
		if (todayPlanDay) {
			const dayStart = new Date()
			dayStart.setHours(0, 0, 0, 0)
			const dayEnd = new Date()
			dayEnd.setHours(23, 59, 59, 999)

			const { data: todaySession } = await supabase
				.from('workout_session')
				.select('id')
				.eq('user_id', user.id)
				.eq('workout_id', todayPlanDay.workoutId)
				.gte('created_at', dayStart.toISOString())
				.lte('created_at', dayEnd.toISOString())
				.maybeSingle()

			todayWorkoutSessionId = todaySession?.id ?? null
		}
	}

	return (
		<div className='w-full p-4 space-y-4'>
			<h1 className='text-2xl font-medium'>Dashboard</h1>

			<DashboardStats stats={stats} />

			<TodayWorkout activePlan={activePlan} todayWorkoutSessionId={todayWorkoutSessionId} />
		</div>
	)
}
