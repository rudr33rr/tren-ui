import { asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { exerciseSets, exercises, workoutExercises, workouts, workoutSession } from '@/lib/db/schema'
import type { DifficultyLevel, WorkoutCardData, WorkoutTag } from '@/types/view'

type CreateWorkoutInput = {
	name: string
	description: string | null
	tag: WorkoutTag | null
	exerciseIds: number[]
}

type FinishWorkoutSessionInput = {
	sessionId: number
	finishedAt: Date
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

type WorkoutSummary = {
	id: number
	name: string
}

export type WorkoutSessionPageData = {
	sessionId: number
	workoutId: number
	workoutName: string
	startedAt: Date
	exercises: Array<{
		id: number
		name: string
		difficulty: DifficultyLevel
	}>
}

export type LastCompletedWorkoutData = {
	sessionId: number
	workoutName: string
	finishedAt: Date | null
	duration: number | null
	tag: WorkoutTag | null
}

type FinishWorkoutSessionResult = { ok: true } | { ok: false; reason: 'invalid-exercise' | 'invalid-session' }

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
	return db
		.select({
			id: workouts.id,
			name: workouts.name,
			description: workouts.description,
			tag: workouts.tag,
			exerciseCount: sql<number>`cast(count(${workoutExercises.id}) as int)`,
		})
		.from(workouts)
		.leftJoin(workoutExercises, eq(workouts.id, workoutExercises.workoutId))
		.groupBy(workouts.id, workouts.name, workouts.description, workouts.tag)
		.orderBy(asc(workouts.name), asc(workouts.id))
}

export async function createWorkout(input: CreateWorkoutInput): Promise<number> {
	const [createdWorkout] = await db
		.insert(workouts)
		.values({
			name: input.name,
			description: input.description,
			tag: input.tag,
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
			name: row.name,
			difficulty: row.difficulty,
		})),
	}
}

export async function finishWorkoutSession(input: FinishWorkoutSessionInput): Promise<FinishWorkoutSessionResult> {
	const [session] = await db
		.select({
			id: workoutSession.id,
			workoutId: workoutSession.workoutId,
			startedAt: workoutSession.startedAt,
			status: workoutSession.status,
		})
		.from(workoutSession)
		.where(eq(workoutSession.id, input.sessionId))

	if (!session || session.status !== 'started') {
		return { ok: false, reason: 'invalid-session' }
	}

	const allowedExerciseRows = await db
		.select({
			exerciseId: workoutExercises.exerciseId,
		})
		.from(workoutExercises)
		.where(eq(workoutExercises.workoutId, session.workoutId))

	const allowedExerciseIds = new Set(allowedExerciseRows.map(row => row.exerciseId))

	if (input.exercises.some(exercise => !allowedExerciseIds.has(exercise.exerciseId))) {
		return { ok: false, reason: 'invalid-exercise' }
	}

	const exerciseSetRows = input.exercises.flatMap(exercise =>
		exercise.sets.map((set, index) => ({
			sessionId: input.sessionId,
			exerciseId: exercise.exerciseId,
			setNumber: index + 1,
			repetitions: set.reps,
			weight: set.weight,
			intensity: set.intensity,
			notes: index === 0 ? exercise.notes : null,
		})),
	)

	const duration = session.startedAt
		? Math.max(1, Math.round((input.finishedAt.getTime() - session.startedAt.getTime()) / 60000))
		: null

	await db.transaction(async tx => {
		await tx.delete(exerciseSets).where(eq(exerciseSets.sessionId, input.sessionId))

		if (exerciseSetRows.length > 0) {
			await tx.insert(exerciseSets).values(exerciseSetRows)
		}

		await tx
			.update(workoutSession)
			.set({
				finishedAt: input.finishedAt,
				status: 'completed',
				duration,
			})
			.where(eq(workoutSession.id, input.sessionId))
	})

	return { ok: true }
}

export async function getLastCompletedWorkout(): Promise<LastCompletedWorkoutData | null> {
	const [session] = await db
		.select({
			sessionId: workoutSession.id,
			workoutName: workouts.name,
			finishedAt: workoutSession.finishedAt,
			duration: workoutSession.duration,
			tag: workouts.tag,
		})
		.from(workoutSession)
		.innerJoin(workouts, eq(workoutSession.workoutId, workouts.id))
		.where(eq(workoutSession.status, 'completed'))
		.orderBy(desc(workoutSession.finishedAt), desc(workoutSession.id))

	return session ?? null
}
