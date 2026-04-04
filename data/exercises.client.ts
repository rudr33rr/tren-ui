'use server'

import { ilike, eq, asc, and } from 'drizzle-orm'
import { db } from '@/db'
import { exercises } from '@/db/schema'
import { isExerciseType } from '@/lib/exerciseTypeIcons'
import type { ExerciseCardData, ExerciseType } from '@/types/exercise.types'

const PAGE_SIZE = 20

export type ExerciseFilters = {
	search?: string
	muscle?: string
	type?: string
}

export async function fetchExercisesPage(page: number, filters: ExerciseFilters = {}): Promise<ExerciseCardData[]> {
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
		secondaryMuscles: [],
		type: item.type,
		trackingType: item.trackingType,
		weightType: item.weightType,
		isUnilateral: item.isUnilateral,
	}))
}
