'use server'

import { revalidatePath } from 'next/cache'
import { listExerciseOptions } from '@/lib/db/exercises'
import { createWorkout, finishWorkoutSession, getWorkoutById, startWorkoutSession } from '@/lib/db/workouts'
import type { WorkoutTag } from '@/types/view'

type CreateWorkoutPayload = {
	name: string
	description: string | null
	tag: WorkoutTag | null
	exerciseIds: number[]
}

type StartWorkoutActionResult = {
	ok: boolean
	error: string | null
	sessionId: number | null
}

type FinishWorkoutPayload = {
	sessionId: number
	exercises: Array<{
		exerciseId: number
		sets: Array<{
			reps: number
			weight: number | null
			intensity: number | null
		}>
		notes: string | null
	}>
}

export type WorkoutActionResult = {
	ok: boolean
	error: string | null
}

const workoutTags: WorkoutTag[] = ['push', 'pull', 'legs', 'cardio']

export async function createWorkoutAction(payload: CreateWorkoutPayload): Promise<WorkoutActionResult> {
	const normalizedName = payload.name.trim()

	if (!normalizedName) {
		return {
			ok: false,
			error: 'Workout name is required',
		}
	}

	if (payload.tag !== null && !workoutTags.includes(payload.tag)) {
		return {
			ok: false,
			error: 'Workout tag is invalid',
		}
	}

	const exerciseOptions = await listExerciseOptions()
	const validExerciseIds = new Set(exerciseOptions.map(exercise => exercise.id))
	const exerciseIds = Array.from(new Set(payload.exerciseIds)).filter(id => validExerciseIds.has(id))

	if (exerciseIds.length === 0) {
		return {
			ok: false,
			error: 'Add at least one exercise',
		}
	}

	if (exerciseIds.length !== payload.exerciseIds.length) {
		return {
			ok: false,
			error: 'One of the selected exercises is invalid',
		}
	}

	try {
		await createWorkout({
			name: normalizedName,
			description: payload.description?.trim() || null,
			tag: payload.tag,
			exerciseIds,
		})
	} catch {
		return {
			ok: false,
			error: 'Failed to create workout',
		}
	}

	revalidatePath('/dashboard/workouts')

	return {
		ok: true,
		error: null,
	}
}

export async function startWorkoutAction(workoutId: number): Promise<StartWorkoutActionResult> {
	const workout = await getWorkoutById(workoutId)

	if (!workout) {
		return {
			ok: false,
			error: 'Workout not found',
			sessionId: null,
		}
	}

	try {
		const sessionId = await startWorkoutSession(workoutId)

		return {
			ok: true,
			error: null,
			sessionId,
		}
	} catch {
		return {
			ok: false,
			error: 'Failed to start workout',
			sessionId: null,
		}
	}
}

export async function finishWorkoutAction(payload: FinishWorkoutPayload): Promise<WorkoutActionResult> {
	if (!Number.isInteger(payload.sessionId) || payload.sessionId <= 0) {
		return {
			ok: false,
			error: 'Workout session is invalid',
		}
	}

	const exercises = payload.exercises
		.map(exercise => ({
			exerciseId: exercise.exerciseId,
			sets: exercise.sets
				.filter(set => Number.isFinite(set.reps) && set.reps > 0)
				.map(set => ({
					reps: Math.trunc(set.reps),
					weight: typeof set.weight === 'number' && Number.isFinite(set.weight) ? Math.trunc(set.weight) : null,
					intensity:
						typeof set.intensity === 'number' && Number.isFinite(set.intensity) ? Math.trunc(set.intensity) : null,
				})),
			notes: exercise.notes?.trim() || null,
		}))
		.filter(exercise => Number.isInteger(exercise.exerciseId) && exercise.exerciseId > 0 && exercise.sets.length > 0)

	if (exercises.length === 0) {
		return {
			ok: false,
			error: 'Add at least one completed set before saving',
		}
	}

	const result = await finishWorkoutSession({
		sessionId: payload.sessionId,
		finishedAt: new Date(),
		exercises,
	})

	if (!result.ok) {
		return {
			ok: false,
			error:
				result.reason === 'invalid-exercise'
					? 'One of the completed exercises does not belong to this workout'
					: 'Workout session could not be saved',
		}
	}

	revalidatePath('/dashboard')
	revalidatePath('/dashboard/workouts')

	return {
		ok: true,
		error: null,
	}
}
