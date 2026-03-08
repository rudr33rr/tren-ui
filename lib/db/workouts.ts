import { asc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { exercises, workoutExercises, workouts, workoutSession } from '@/lib/db/schema'
import type { DifficultyLevel, WorkoutCardData, WorkoutTag } from '@/types/view'

type CreateWorkoutInput = {
	name: string
	description: string | null
	tag: WorkoutTag | null
	duration: number | null
	exerciseIds: number[]
}

type WorkoutSummary = {
	id: number
	name: string
}

export type WorkoutSessionPageData = {
	sessionId: number
	workoutId: number
	workoutName: string
	startedAt: Date | null
	exercises: Array<{
		id: number
		name: string
		difficulty: DifficultyLevel
	}>
}

export async function getWorkoutById(workoutId: number): Promise<WorkoutSummary | null> {
	const [workout] = await db
		.select({
			id: workouts.id,
			name: workouts.name,
		})
		.from(workouts)
		.where(eq(workouts.id, workoutId))

	return workout ?? null
}

export async function listWorkouts(): Promise<WorkoutCardData[]> {
	const rows = await db
		.select({
			id: workouts.id,
			name: workouts.name,
			description: workouts.description,
			tag: workouts.tag,
			duration: workouts.duration,
			exerciseCount: sql<number>`cast(count(${workoutExercises.id}) as int)`,
		})
		.from(workouts)
		.leftJoin(workoutExercises, eq(workouts.id, workoutExercises.workoutId))
		.groupBy(workouts.id, workouts.name, workouts.description, workouts.tag, workouts.duration)
		.orderBy(asc(workouts.name), asc(workouts.id))

	return rows.map(row => ({
		id: row.id,
		name: row.name,
		description: row.description,
		tag: row.tag,
		duration: row.duration,
		exerciseCount: row.exerciseCount,
	}))
}

export async function createWorkout(input: CreateWorkoutInput): Promise<number> {
	const [createdWorkout] = await db
		.insert(workouts)
		.values({
			name: input.name,
			description: input.description,
			tag: input.tag,
			duration: input.duration,
		})
		.returning({ id: workouts.id })

	if (input.exerciseIds.length > 0) {
		await db.insert(workoutExercises).values(
			input.exerciseIds.map(exerciseId => ({
				workoutId: createdWorkout.id,
				exerciseId,
			})),
		)
	}

	return createdWorkout.id
}

export async function startWorkoutSession(workoutId: number): Promise<number> {
	const [session] = await db
		.insert(workoutSession)
		.values({
			workoutId,
			startedAt: new Date(),
			status: 'started',
		})
		.returning({ id: workoutSession.id })

	return session.id
}

export async function getWorkoutSessionPageData(sessionId: number): Promise<WorkoutSessionPageData | null> {
	const [session] = await db
		.select({
			sessionId: workoutSession.id,
			workoutId: workouts.id,
			workoutName: workouts.name,
			startedAt: workoutSession.startedAt,
		})
		.from(workoutSession)
		.innerJoin(workouts, eq(workoutSession.workoutId, workouts.id))
		.where(eq(workoutSession.id, sessionId))

	if (!session) {
		return null
	}

	const exerciseRows = await db
		.select({
			id: exercises.id,
			name: exercises.exerciseName,
			difficulty: exercises.difficulty,
		})
		.from(workoutExercises)
		.innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
		.where(eq(workoutExercises.workoutId, session.workoutId))
		.orderBy(asc(workoutExercises.id), asc(exercises.id))

	return {
		sessionId: session.sessionId,
		workoutId: session.workoutId,
		workoutName: session.workoutName,
		startedAt: session.startedAt,
		exercises: exerciseRows.map(row => ({
			id: row.id,
			name: row.name ?? `Exercise ${row.id}`,
			difficulty: row.difficulty,
		})),
	}
}
