import { and, asc, eq, ilike, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { exercises, muscleGroups } from '@/lib/db/schema'
import type { ExerciseCardData } from '@/types/view'

type MuscleOption = {
	id: number
	name: string
}

export type ExerciseOption = {
	id: number
	name: string
}

type CreateExerciseInput = {
	name: string
	difficulty: 'easy' | 'intermediate' | 'hard'
	primaryMuscleId: number | null
	secondaryMuscleIds: number[]
	instructions: string[]
}

export async function getMuscleGroups(): Promise<MuscleOption[]> {
	return db
		.select({
			id: muscleGroups.id,
			name: muscleGroups.name,
		})
		.from(muscleGroups)
		.orderBy(asc(muscleGroups.name))
}

export async function listExerciseOptions(): Promise<ExerciseOption[]> {
	const rows = await db
		.select({
			id: exercises.id,
			name: exercises.exerciseName,
		})
		.from(exercises)
		.orderBy(asc(exercises.exerciseName), asc(exercises.id))

	return rows.map(row => ({
		id: row.id,
		name: row.name ?? `Exercise ${row.id}`,
	}))
}

export async function listExercises(filters: { search?: string; muscle?: string }): Promise<ExerciseCardData[]> {
	const normalizedSearch = filters.search?.trim()
	const parsedMuscleId = filters.muscle ? Number(filters.muscle) : Number.NaN
	const selectedMuscleId = Number.isInteger(parsedMuscleId) ? parsedMuscleId : null

	const conditions = []

	if (normalizedSearch) {
		conditions.push(ilike(exercises.exerciseName, `%${normalizedSearch}%`))
	}

	if (selectedMuscleId !== null) {
		conditions.push(eq(exercises.primaryMuscleId, selectedMuscleId))
	}

	const rows = await db
		.select({
			id: exercises.id,
			name: exercises.exerciseName,
			difficulty: exercises.difficulty,
			primaryMuscleId: muscleGroups.id,
			primaryMuscleName: muscleGroups.name,
			secondaryMuscleIds: exercises.secondaryMuscleIds,
		})
		.from(exercises)
		.leftJoin(muscleGroups, eq(exercises.primaryMuscleId, muscleGroups.id))
		.where(conditions.length ? and(...conditions) : sql`true`)
		.orderBy(asc(exercises.exerciseName), asc(exercises.id))

	const secondaryIds = Array.from(new Set(rows.flatMap(row => row.secondaryMuscleIds ?? [])))

	const secondaryRows =
		secondaryIds.length > 0
			? await db
					.select({
						id: muscleGroups.id,
						name: muscleGroups.name,
					})
					.from(muscleGroups)
					.where(inArray(muscleGroups.id, secondaryIds))
			: []

	const secondaryMap = new Map(secondaryRows.map(row => [row.id, row]))

	return rows.map(row => ({
		id: row.id,
		name: row.name,
		difficulty: row.difficulty,
		primaryMuscle:
			row.primaryMuscleId && row.primaryMuscleName
				? {
						id: row.primaryMuscleId,
						name: row.primaryMuscleName,
					}
				: null,
		secondaryMuscles: (row.secondaryMuscleIds ?? []).flatMap(id => {
			const muscle = secondaryMap.get(id)
			return muscle ? [muscle] : []
		}),
	}))
}

export async function createExercise(input: CreateExerciseInput): Promise<number> {
	const [createdExercise] = await db
		.insert(exercises)
		.values({
			exerciseName: input.name,
			difficulty: input.difficulty,
			primaryMuscleId: input.primaryMuscleId,
			secondaryMuscleIds: input.secondaryMuscleIds.length > 0 ? input.secondaryMuscleIds : null,
			instructions: input.instructions.length > 0 ? input.instructions : null,
		})
		.returning({ id: exercises.id })

	return createdExercise.id
}
