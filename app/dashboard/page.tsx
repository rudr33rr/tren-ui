import { eq, and, gte, lte } from 'drizzle-orm'
import { db } from '@/db'
import { workoutSession } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'
import { fetchActivePlan } from '@/data/plans.server'
import { fetchDashboardStats } from '@/data/dashboard.server'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { TodayWorkout } from '@/components/dashboard/today-workout'

export default async function DashboardPage() {
	const userId = await getCurrentUserId()

	const [stats, activePlan] = await Promise.all([fetchDashboardStats(userId), fetchActivePlan(userId)])

	let todayWorkoutSessionId: number | null = null
	if (activePlan) {
		const todayDayIndex = (new Date().getDay() + 6) % 7
		const todayPlanDay = activePlan.days.find(d => d.dayIndex === todayDayIndex)
		if (todayPlanDay) {
			const dayStart = new Date()
			dayStart.setHours(0, 0, 0, 0)
			const dayEnd = new Date()
			dayEnd.setHours(23, 59, 59, 999)

			const todaySession = await db.query.workoutSession.findFirst({
				where: and(
					eq(workoutSession.userId, userId),
					eq(workoutSession.workoutId, todayPlanDay.workoutId),
					gte(workoutSession.createdAt, dayStart),
					lte(workoutSession.createdAt, dayEnd),
				),
				columns: { id: true },
			})

			todayWorkoutSessionId = todaySession?.id ?? null
		}
	}

	return (
		<div className='w-full p-4 space-y-4'>
			<h1 className='text-2xl font-medium'>Home</h1>

			<DashboardStats stats={stats} />

			<TodayWorkout activePlan={activePlan} todayWorkoutSessionId={todayWorkoutSessionId} />
		</div>
	)
}
