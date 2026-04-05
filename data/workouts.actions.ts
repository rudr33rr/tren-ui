'use server'

import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { workouts, workoutExercises, workoutPlanDays, workoutSession, exerciseSession, exerciseSet } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'
import type { ExerciseCardData } from '@/types/exercise.types'

export async function deleteWorkout(workoutId: number): Promise<void> {
	const userId = await getCurrentUserId()

	await db.transaction(async tx => {
		const workout = await tx.query.workouts.findFirst({
			where: (w, { and }) => and(eq(w.id, workoutId), eq(w.userId, userId)),
			columns: { id: true },
		})
		if (!workout) throw new Error('Workout not found.')

		const sessions = await tx
			.select({ id: workoutSession.id })
			.from(workoutSession)
			.where(eq(workoutSession.workoutId, workoutId))

		const sessionIds = sessions.map(s => s.id)

		if (sessionIds.length > 0) {
			const exSessions = await tx
				.select({ id: exerciseSession.id })
				.from(exerciseSession)
				.where(inArray(exerciseSession.sessionId, sessionIds))

			const exSessionIds = exSessions.map(es => es.id)

			if (exSessionIds.length > 0) {
				await tx.delete(exerciseSet).where(inArray(exerciseSet.sessionId, exSessionIds))
			}

			await tx.delete(exerciseSession).where(inArray(exerciseSession.sessionId, sessionIds))
		}

		await tx.delete(workoutPlanDays).where(eq(workoutPlanDays.workoutId, workoutId))
		await tx.delete(workoutSession).where(eq(workoutSession.workoutId, workoutId))
		await tx.delete(workoutExercises).where(eq(workoutExercises.workoutId, workoutId))
		await tx.delete(workouts).where(eq(workouts.id, workoutId))
	})
}

export async function createWorkout({
	name,
	exercises,
}: {
	name: string
	exercises: ExerciseCardData[]
}): Promise<void> {
	const userId = await getCurrentUserId()

	await db.transaction(async tx => {
		const [workout] = await tx.insert(workouts).values({ name: name.trim(), userId }).returning({ id: workouts.id })

		if (exercises.length > 0) {
			await tx.insert(workoutExercises).values(
				exercises.map((exercise, index) => ({
					workoutId: workout.id,
					exerciseId: exercise.id,
					exerciseOrder: index + 1,
				})),
			)
		}
	})
}

export async function updateWorkout({
	workoutId,
	name,
	description,
}: {
	workoutId: number
	name: string
	description: string
}): Promise<void> {
	const userId = await getCurrentUserId()

	await db
		.update(workouts)
		.set({
			name: name.trim(),
			description: description.trim().length > 0 ? description.trim() : null,
		})
		.where(eq(workouts.id, workoutId))

	// Note: userId check will be added when auth is implemented
	void userId
}
