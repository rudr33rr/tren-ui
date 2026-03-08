'use server'

import { revalidatePath } from 'next/cache'
import { listExerciseOptions } from '@/lib/db/exercises'
import { createWorkout, getWorkoutById, startWorkoutSession } from '@/lib/db/workouts'
import type { WorkoutTag } from '@/types/view'

type CreateWorkoutPayload = {
	name: string
	description: string | null
	tag: WorkoutTag | null
	duration: number | null
	exerciseIds: number[]
}

type StartWorkoutActionResult = {
	ok: boolean
	error: string | null
	sessionId: number | null
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

	if (payload.duration !== null && (!Number.isInteger(payload.duration) || payload.duration <= 0)) {
		return {
			ok: false,
			error: 'Duration must be a positive number',
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
			duration: payload.duration,
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
