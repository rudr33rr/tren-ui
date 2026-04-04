import { count, eq, gte, and } from 'drizzle-orm'
import { db } from '@/db'
import { workoutSession } from '@/db/schema'

export type DashboardStats = {
	totalSessions: number
	thisWeekSessions: number
	thisMonthSessions: number
}

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
	const now = new Date()

	const weekStart = new Date(now)
	weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
	weekStart.setHours(0, 0, 0, 0)

	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

	const [totalResult, weekResult, monthResult] = await Promise.all([
		db.select({ count: count() }).from(workoutSession).where(eq(workoutSession.userId, userId)),
		db
			.select({ count: count() })
			.from(workoutSession)
			.where(and(eq(workoutSession.userId, userId), gte(workoutSession.createdAt, weekStart))),
		db
			.select({ count: count() })
			.from(workoutSession)
			.where(and(eq(workoutSession.userId, userId), gte(workoutSession.createdAt, monthStart))),
	])

	return {
		totalSessions: totalResult[0]?.count ?? 0,
		thisWeekSessions: weekResult[0]?.count ?? 0,
		thisMonthSessions: monthResult[0]?.count ?? 0,
	}
}
