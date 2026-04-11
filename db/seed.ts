/**
 * Seed script — populates muscle groups, exercises, and (optionally)
 * user-specific workouts, a plan and past sessions for testing.
 *
 * Usage:
 *   npm run db:seed
 *   SEED_USER_ID=<your-user-id> npm run db:seed
 *
 * The user ID can be found in the Neon Console → Auth → Users after signing up.
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

// ─── Muscle groups ──────────────────────────────────────────────────────────

const MUSCLE_GROUPS = [
	'Chest',
	'Back',
	'Shoulders',
	'Biceps',
	'Triceps',
	'Quadriceps',
	'Hamstrings',
	'Glutes',
	'Core',
	'Calves',
	'Traps',
	'Forearms',
]

// ─── Exercises ───────────────────────────────────────────────────────────────

type ExerciseSeed = {
	name: string
	primaryMuscle: string
	type: 'strength' | 'cardio' | 'flexibility' | 'core' | 'plyometric'
	trackingType: 'reps' | 'duration'
	weightType: 'weighted' | 'bodyweight'
	isUnilateral?: boolean
}

const EXERCISES: ExerciseSeed[] = [
	// Chest
	{ name: 'Bench Press', primaryMuscle: 'Chest', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Incline Dumbbell Press', primaryMuscle: 'Chest', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Cable Fly', primaryMuscle: 'Chest', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Push-up', primaryMuscle: 'Chest', type: 'strength', trackingType: 'reps', weightType: 'bodyweight' },
	// Back
	{ name: 'Deadlift', primaryMuscle: 'Back', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Pull-up', primaryMuscle: 'Back', type: 'strength', trackingType: 'reps', weightType: 'bodyweight' },
	{ name: 'Barbell Row', primaryMuscle: 'Back', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Lat Pulldown', primaryMuscle: 'Back', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Seated Cable Row', primaryMuscle: 'Back', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	// Shoulders
	{ name: 'Overhead Press', primaryMuscle: 'Shoulders', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Lateral Raise', primaryMuscle: 'Shoulders', type: 'strength', trackingType: 'reps', weightType: 'weighted', isUnilateral: true },
	{ name: 'Face Pull', primaryMuscle: 'Shoulders', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	// Biceps
	{ name: 'Barbell Curl', primaryMuscle: 'Biceps', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Hammer Curl', primaryMuscle: 'Biceps', type: 'strength', trackingType: 'reps', weightType: 'weighted', isUnilateral: true },
	{ name: 'Cable Curl', primaryMuscle: 'Biceps', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	// Triceps
	{ name: 'Tricep Dip', primaryMuscle: 'Triceps', type: 'strength', trackingType: 'reps', weightType: 'bodyweight' },
	{ name: 'Tricep Pushdown', primaryMuscle: 'Triceps', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Skull Crusher', primaryMuscle: 'Triceps', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	// Quads
	{ name: 'Squat', primaryMuscle: 'Quadriceps', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Leg Press', primaryMuscle: 'Quadriceps', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Leg Extension', primaryMuscle: 'Quadriceps', type: 'strength', trackingType: 'reps', weightType: 'weighted', isUnilateral: true },
	{ name: 'Bulgarian Split Squat', primaryMuscle: 'Quadriceps', type: 'strength', trackingType: 'reps', weightType: 'weighted', isUnilateral: true },
	// Hamstrings
	{ name: 'Romanian Deadlift', primaryMuscle: 'Hamstrings', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	{ name: 'Leg Curl', primaryMuscle: 'Hamstrings', type: 'strength', trackingType: 'reps', weightType: 'weighted', isUnilateral: true },
	// Glutes
	{ name: 'Hip Thrust', primaryMuscle: 'Glutes', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	// Core
	{ name: 'Plank', primaryMuscle: 'Core', type: 'core', trackingType: 'duration', weightType: 'bodyweight' },
	{ name: 'Crunch', primaryMuscle: 'Core', type: 'core', trackingType: 'reps', weightType: 'bodyweight' },
	{ name: 'Hanging Leg Raise', primaryMuscle: 'Core', type: 'core', trackingType: 'reps', weightType: 'bodyweight' },
	// Calves
	{ name: 'Calf Raise', primaryMuscle: 'Calves', type: 'strength', trackingType: 'reps', weightType: 'weighted' },
	// Cardio
	{ name: 'Running', primaryMuscle: 'Quadriceps', type: 'cardio', trackingType: 'duration', weightType: 'bodyweight' },
]

// ─── User data ───────────────────────────────────────────────────────────────

async function seedUserData(userId: string, exerciseMap: Map<string, number>, workoutIds: { push: number; pull: number; legs: number }) {
	// Workouts are already created below with the exercise map
	// Create a PPL plan
	const [plan] = await db
		.insert(schema.workoutPlans)
		.values({ userId, name: 'PPL Plan', isActive: true })
		.returning({ id: schema.workoutPlans.id })

	// Mon=0 Wed=2 Fri=4 (0=Monday in our system: (getDay()+6)%7)
	await db.insert(schema.workoutPlanDays).values([
		{ planId: plan.id, workoutId: workoutIds.push, dayIndex: 0 },
		{ planId: plan.id, workoutId: workoutIds.pull, dayIndex: 2 },
		{ planId: plan.id, workoutId: workoutIds.legs, dayIndex: 4 },
	])

	// Seed 6 past sessions (2 push, 2 pull, 2 legs) spread over the past 3 weeks
	const daysAgo = (n: number) => {
		const d = new Date()
		d.setDate(d.getDate() - n)
		return d
	}

	const sessionDefs = [
		{ workoutId: workoutIds.push, daysBack: 1, exercises: ['Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Tricep Pushdown'] },
		{ workoutId: workoutIds.pull, daysBack: 3, exercises: ['Deadlift', 'Pull-up', 'Barbell Row', 'Barbell Curl'] },
		{ workoutId: workoutIds.legs, daysBack: 5, exercises: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Calf Raise'] },
		{ workoutId: workoutIds.push, daysBack: 8, exercises: ['Bench Press', 'Cable Fly', 'Overhead Press', 'Skull Crusher'] },
		{ workoutId: workoutIds.pull, daysBack: 10, exercises: ['Deadlift', 'Lat Pulldown', 'Seated Cable Row', 'Hammer Curl'] },
		{ workoutId: workoutIds.legs, daysBack: 12, exercises: ['Squat', 'Bulgarian Split Squat', 'Leg Curl', 'Hip Thrust'] },
	]

	for (const def of sessionDefs) {
		const [session] = await db
			.insert(schema.workoutSession)
			.values({ userId, workoutId: def.workoutId, createdAt: daysAgo(def.daysBack) })
			.returning({ id: schema.workoutSession.id })

		const exerciseSeedData = def.exercises
			.map(name => exerciseMap.get(name))
			.filter((id): id is number => id !== undefined)

		const insertedExSessions = await db
			.insert(schema.exerciseSession)
			.values(exerciseSeedData.map(exerciseId => ({ sessionId: session.id, exerciseId, userId })))
			.returning({ id: schema.exerciseSession.id, exerciseId: schema.exerciseSession.exerciseId })

		const sets = insertedExSessions.flatMap(exSession => {
			const baseWeight = 40 + Math.random() * 60
			return Array.from({ length: 3 }, () => ({
				sessionId: exSession.id,
				userId,
				reps: 8 + Math.floor(Math.random() * 5),
				weight: String(Math.round(baseWeight * 10) / 10),
				intensity: 6 + Math.floor(Math.random() * 4),
			}))
		})

		if (sets.length > 0) {
			await db.insert(schema.exerciseSet).values(sets)
		}
	}

	console.log(`  ✓ Created PPL plan + 6 past sessions for user ${userId}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	const userId = process.env.SEED_USER_ID ?? null

	console.log('Seeding database...\n')

	// 1. Muscle groups
	const insertedGroups = await db
		.insert(schema.muscleGroups)
		.values(MUSCLE_GROUPS.map(name => ({ name })))
		.onConflictDoNothing()
		.returning({ id: schema.muscleGroups.id, name: schema.muscleGroups.name })

	// Build a map; if all already existed, query them
	let groupMap: Map<string, number>
	if (insertedGroups.length > 0) {
		groupMap = new Map(insertedGroups.map(g => [g.name, g.id]))
	} else {
		const existing = await db.select().from(schema.muscleGroups)
		groupMap = new Map(existing.map(g => [g.name, g.id]))
	}
	console.log(`  ✓ Muscle groups: ${groupMap.size}`)

	// 2. Exercises
	const exerciseValues = EXERCISES.map(e => ({
		exerciseName: e.name,
		primaryMuscleId: groupMap.get(e.primaryMuscle) ?? null,
		type: e.type,
		trackingType: e.trackingType,
		weightType: e.weightType,
		isUnilateral: e.isUnilateral ?? false,
	}))

	const insertedExercises = await db
		.insert(schema.exercises)
		.values(exerciseValues)
		.onConflictDoNothing()
		.returning({ id: schema.exercises.id, name: schema.exercises.exerciseName })

	let exerciseMap: Map<string, number>
	if (insertedExercises.length > 0) {
		exerciseMap = new Map(insertedExercises.map(e => [e.name!, e.id]))
	} else {
		const existing = await db.select({ id: schema.exercises.id, name: schema.exercises.exerciseName }).from(schema.exercises)
		exerciseMap = new Map(existing.map(e => [e.name!, e.id]))
	}
	console.log(`  ✓ Exercises: ${exerciseMap.size}`)

	// 3. User-specific data (workouts + plan + sessions)
	if (!userId) {
		console.log('\n  ℹ  Skipping user data — set SEED_USER_ID=<id> to seed workouts, plans and sessions.')
		console.log('  ℹ  Find your user ID in Neon Console → Auth → Users.\n')
		return
	}

	// Push workout
	const [pushWorkout] = await db
		.insert(schema.workouts)
		.values({ userId, name: 'Push Day' })
		.returning({ id: schema.workouts.id })

	const pushExercises = ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Overhead Press', 'Lateral Raise', 'Tricep Pushdown', 'Skull Crusher']
	await db.insert(schema.workoutExercises).values(
		pushExercises
			.map(name => exerciseMap.get(name))
			.filter((id): id is number => id !== undefined)
			.map((exerciseId, index) => ({ workoutId: pushWorkout.id, exerciseId, exerciseOrder: index + 1 })),
	)

	// Pull workout
	const [pullWorkout] = await db
		.insert(schema.workouts)
		.values({ userId, name: 'Pull Day' })
		.returning({ id: schema.workouts.id })

	const pullExercises = ['Deadlift', 'Pull-up', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'Barbell Curl', 'Hammer Curl']
	await db.insert(schema.workoutExercises).values(
		pullExercises
			.map(name => exerciseMap.get(name))
			.filter((id): id is number => id !== undefined)
			.map((exerciseId, index) => ({ workoutId: pullWorkout.id, exerciseId, exerciseOrder: index + 1 })),
	)

	// Legs workout
	const [legsWorkout] = await db
		.insert(schema.workouts)
		.values({ userId, name: 'Leg Day' })
		.returning({ id: schema.workouts.id })

	const legsExercises = ['Squat', 'Leg Press', 'Bulgarian Split Squat', 'Romanian Deadlift', 'Leg Curl', 'Hip Thrust', 'Calf Raise']
	await db.insert(schema.workoutExercises).values(
		legsExercises
			.map(name => exerciseMap.get(name))
			.filter((id): id is number => id !== undefined)
			.map((exerciseId, index) => ({ workoutId: legsWorkout.id, exerciseId, exerciseOrder: index + 1 })),
	)

	console.log(`  ✓ Created 3 workouts (Push / Pull / Legs) for user ${userId}`)

	await seedUserData(userId, exerciseMap, {
		push: pushWorkout.id,
		pull: pullWorkout.id,
		legs: legsWorkout.id,
	})

	console.log('\nSeed complete.')
}

main().catch(err => {
	console.error('Seed failed:', err)
	process.exit(1)
})
