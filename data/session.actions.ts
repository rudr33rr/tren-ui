'use server'

import { db } from '@/db'
import { workoutSession, exerciseSession, exerciseSet } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'

type SetEntry = {
	reps?: number
	durationSec?: number
	weight?: number
	intensity?: number
}

type ExerciseState = {
	exerciseId: number
	sets: SetEntry[]
	notes?: string
}

export async function saveSession({
	workoutId,
	exercises,
}: {
	workoutId: number
	exercises: ExerciseState[]
}): Promise<{ sessionId: number }> {
	const userId = await getCurrentUserId()

	const [createdSession] = await db
		.insert(workoutSession)
		.values({ workoutId, userId })
		.returning({ id: workoutSession.id })

	if (exercises.length > 0) {
		const insertedExerciseSessions = await db
			.insert(exerciseSession)
			.values(
				exercises.map(exercise => ({
					sessionId: createdSession.id,
					exerciseId: exercise.exerciseId,
					notes: exercise.notes ?? null,
					userId,
				})),
			)
			.returning({ id: exerciseSession.id, exerciseId: exerciseSession.exerciseId })

		const exercisesById = new Map(exercises.map(e => [e.exerciseId, e]))

		const setRows = insertedExerciseSessions.flatMap(inserted => {
			const exercise = exercisesById.get(inserted.exerciseId)
			if (!exercise) return []

			return exercise.sets.map(set => ({
				sessionId: inserted.id,
				reps: set.reps ?? null,
				durationSec: set.durationSec ?? null,
				weight: set.weight != null ? String(set.weight) : null,
				intensity: set.intensity ?? null,
				userId,
			}))
		})

		if (setRows.length > 0) {
			await db.insert(exerciseSet).values(setRows)
		}
	}

	return { sessionId: createdSession.id }
}
