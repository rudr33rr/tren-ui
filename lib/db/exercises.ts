import { and, asc, desc, eq, ilike, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { exerciseSets, exercises, muscleGroups, workouts, workoutSession } from '@/lib/db/schema'
import type {
	ExerciseCardData,
	ExerciseOption,
	ExercisePageData,
	ExerciseSessionHistoryItem,
	MuscleOption,
} from '@/types/view'

type CreateExerciseInput = {
	name: string
	difficulty: 'easy' | 'intermediate' | 'hard'
	primaryMuscleId: number | null
	secondaryMuscleIds: number[]
	instructions: string[]
}

async function resolveSecondaryMuscles(ids: number[]): Promise<Map<number, MuscleOption>> {
	if (ids.length === 0) return new Map()

	const rows = await db
		.select({ id: muscleGroups.id, name: muscleGroups.name })
		.from(muscleGroups)
		.where(inArray(muscleGroups.id, ids))

	return new Map(rows.map(row => [row.id, row]))
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
	return db
		.select({
			id: exercises.id,
			name: exercises.exerciseName,
		})
		.from(exercises)
		.orderBy(asc(exercises.exerciseName), asc(exercises.id))
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
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(asc(exercises.exerciseName), asc(exercises.id))

	const secondaryIds = Array.from(new Set(rows.flatMap(row => row.secondaryMuscleIds ?? [])))
	const secondaryMap = await resolveSecondaryMuscles(secondaryIds)

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

export async function getExercisePageData(exerciseId: number): Promise<ExercisePageData | null> {
	const [exercise] = await db
		.select({
			id: exercises.id,
			name: exercises.exerciseName,
			difficulty: exercises.difficulty,
			primaryMuscleId: muscleGroups.id,
			primaryMuscleName: muscleGroups.name,
			secondaryMuscleIds: exercises.secondaryMuscleIds,
			instructions: exercises.instructions,
		})
		.from(exercises)
		.leftJoin(muscleGroups, eq(exercises.primaryMuscleId, muscleGroups.id))
		.where(eq(exercises.id, exerciseId))

	if (!exercise) {
		return null
	}

	const secondaryIds = exercise.secondaryMuscleIds ?? []
	const secondaryMap = await resolveSecondaryMuscles(secondaryIds)

	const sessionRows = await db
		.select({
			sessionId: workoutSession.id,
			workoutId: workouts.id,
			workoutName: workouts.name,
			finishedAt: workoutSession.finishedAt,
			duration: workoutSession.duration,
			setNumber: exerciseSets.setNumber,
			repetitions: exerciseSets.repetitions,
			weight: exerciseSets.weight,
			intensity: exerciseSets.intensity,
			notes: exerciseSets.notes,
		})
		.from(exerciseSets)
		.innerJoin(workoutSession, eq(exerciseSets.sessionId, workoutSession.id))
		.innerJoin(workouts, eq(workoutSession.workoutId, workouts.id))
		.where(and(eq(exerciseSets.exerciseId, exerciseId), eq(workoutSession.status, 'completed')))
		.orderBy(desc(workoutSession.finishedAt), desc(workoutSession.id), asc(exerciseSets.setNumber))

	const sessions = sessionRows.reduce<ExerciseSessionHistoryItem[]>((result, row) => {
		const existingSession = result.at(-1)

		if (!existingSession || existingSession.sessionId !== row.sessionId) {
			result.push({
				sessionId: row.sessionId,
				workoutId: row.workoutId,
				workoutName: row.workoutName,
				finishedAt: row.finishedAt,
				duration: row.duration,
				notes: row.notes,
				totalRepetitions: row.repetitions,
				maxWeight: row.weight,
				sets: [
					{
						setNumber: row.setNumber,
						repetitions: row.repetitions,
						weight: row.weight,
						intensity: row.intensity,
					},
				],
			})

			return result
		}

		existingSession.notes = existingSession.notes ?? row.notes
		existingSession.totalRepetitions += row.repetitions
		existingSession.maxWeight =
			typeof row.weight === 'number'
				? typeof existingSession.maxWeight === 'number'
					? Math.max(existingSession.maxWeight, row.weight)
					: row.weight
				: existingSession.maxWeight
		existingSession.sets.push({
			setNumber: row.setNumber,
			repetitions: row.repetitions,
			weight: row.weight,
			intensity: row.intensity,
		})

		return result
	}, [])

	return {
		id: exercise.id,
		name: exercise.name,
		difficulty: exercise.difficulty,
		primaryMuscle:
			exercise.primaryMuscleId && exercise.primaryMuscleName
				? {
						id: exercise.primaryMuscleId,
						name: exercise.primaryMuscleName,
					}
				: null,
		secondaryMuscles: secondaryIds.flatMap(id => {
			const muscle = secondaryMap.get(id)
			return muscle ? [muscle] : []
		}),
		instructions: exercise.instructions ?? [],
		sessions,
	}
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
