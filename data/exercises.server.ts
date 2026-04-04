'use server'

import { ilike, eq, asc, and } from 'drizzle-orm'
import { db } from '@/db'
import { exercises, muscleGroups } from '@/db/schema'
import { isExerciseType } from '@/lib/exerciseTypeIcons'
import type { ExerciseCardData, MuscleGroup, ExerciseType } from '@/types/exercise.types'

const PAGE_SIZE = 20

export type ExerciseFilters = {
	search?: string
	muscle?: string
	type?: string
}

export async function fetchMuscleGroups(): Promise<{ muscles: MuscleGroup[]; error: boolean }> {
	try {
		const data = await db
			.select({ id: muscleGroups.id, name: muscleGroups.name })
			.from(muscleGroups)
			.orderBy(asc(muscleGroups.name))
		return { muscles: data, error: false }
	} catch {
		return { muscles: [], error: true }
	}
}

export async function fetchInitialExercises(
	filters: ExerciseFilters,
	musclesById: Map<number, MuscleGroup>,
	page = 0,
): Promise<ExerciseCardData[]> {
	const { search, muscle, type } = filters

	const conditions = []
	if (search) conditions.push(ilike(exercises.exerciseName, `%${search}%`))
	if (muscle) conditions.push(eq(exercises.primaryMuscleId, Number(muscle)))
	if (type && isExerciseType(type)) conditions.push(eq(exercises.type, type as ExerciseType))

	const data = await db.query.exercises.findMany({
		with: { primaryMuscle: true },
		where: conditions.length > 0 ? and(...conditions) : undefined,
		orderBy: [asc(exercises.id)],
		limit: PAGE_SIZE,
		offset: page * PAGE_SIZE,
	})

	return data.map(item => ({
		id: item.id,
		name: item.exerciseName,
		primaryMuscle: item.primaryMuscle ? { id: item.primaryMuscle.id, name: item.primaryMuscle.name } : null,
		secondaryMuscles: (item.secondaryMuscleIds ?? [])
			.map(mid => musclesById.get(mid))
			.filter((x): x is MuscleGroup => Boolean(x)),
		type: item.type,
		trackingType: item.trackingType,
		weightType: item.weightType,
		isUnilateral: item.isUnilateral,
	}))
}
