'use server'

import { revalidatePath } from 'next/cache'
import { createExercise, getMuscleGroups } from '@/lib/db/exercises'
import { difficultyLevelValues } from '@/lib/db/schema'
import type { DifficultyLevel } from '@/types/view'

type CreateExercisePayload = {
	name: string
	difficulty: DifficultyLevel
	primaryMuscleId: number | null
	secondaryMuscleIds: number[]
	instructions: string[]
}

export type CreateExerciseActionResult = {
	ok: boolean
	error: string | null
}

const validDifficultyLevels: readonly DifficultyLevel[] = difficultyLevelValues

export async function createExerciseAction(payload: CreateExercisePayload): Promise<CreateExerciseActionResult> {
	const normalizedName = payload.name.trim()

	if (!normalizedName) {
		return {
			ok: false,
			error: 'Exercise name is required',
		}
	}

	if (!validDifficultyLevels.includes(payload.difficulty)) {
		return {
			ok: false,
			error: 'Difficulty level is invalid',
		}
	}

	const muscleGroups = await getMuscleGroups()
	const validMuscleIds = new Set(muscleGroups.map(group => group.id))

	if (payload.primaryMuscleId !== null && !validMuscleIds.has(payload.primaryMuscleId)) {
		return {
			ok: false,
			error: 'Primary muscle is invalid',
		}
	}

	const secondaryMuscleIds = Array.from(new Set(payload.secondaryMuscleIds)).filter(id => validMuscleIds.has(id))

	if (secondaryMuscleIds.length !== payload.secondaryMuscleIds.length) {
		return {
			ok: false,
			error: 'One of the secondary muscles is invalid',
		}
	}

	const filteredSecondaryMuscleIds = secondaryMuscleIds.filter(id => id !== payload.primaryMuscleId)
	const instructions = payload.instructions.map(step => step.trim()).filter(Boolean)

	try {
		await createExercise({
			name: normalizedName,
			difficulty: payload.difficulty,
			primaryMuscleId: payload.primaryMuscleId,
			secondaryMuscleIds: filteredSecondaryMuscleIds,
			instructions,
		})
	} catch {
		return {
			ok: false,
			error: 'Failed to create exercise',
		}
	}

	revalidatePath('/dashboard/exercises')

	return {
		ok: true,
		error: null,
	}
}
