/**
 * Seed script — populates muscle groups and exercises.
 *
 * Usage:
 *   npm run db:seed
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

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

async function main() {
	console.log('Seeding database...\n')

	const insertedGroups = await db
		.insert(schema.muscleGroups)
		.values(MUSCLE_GROUPS.map(name => ({ name })))
		.onConflictDoNothing()
		.returning({ id: schema.muscleGroups.id, name: schema.muscleGroups.name })

	let groupMap: Map<string, number>
	if (insertedGroups.length > 0) {
		groupMap = new Map(insertedGroups.map(g => [g.name, g.id]))
	} else {
		const existing = await db.select().from(schema.muscleGroups)
		groupMap = new Map(existing.map(g => [g.name, g.id]))
	}
	console.log(`  ✓ Muscle groups: ${groupMap.size}`)

	const exerciseValues = EXERCISES.map(e => ({
		exerciseName: e.name,
		primaryMuscleId: groupMap.get(e.primaryMuscle) ?? null,
		type: e.type,
		trackingType: e.trackingType,
		weightType: e.weightType,
		isUnilateral: e.isUnilateral ?? false,
	}))

	const inserted = await db
		.insert(schema.exercises)
		.values(exerciseValues)
		.onConflictDoNothing()
		.returning({ id: schema.exercises.id })

	console.log(`  ✓ Exercises inserted: ${inserted.length}`)
	console.log('\nSeed complete.')
}

main().catch(err => {
	console.error('Seed failed:', err)
	process.exit(1)
})
