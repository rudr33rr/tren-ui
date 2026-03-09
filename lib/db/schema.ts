import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, real, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// ── Enums ──────────────────────────────────────────────────────

export const difficultyLevelEnum = pgEnum('difficulty_level', ['easy', 'intermediate', 'hard'])
export const sessionStatusEnum = pgEnum('session_status', ['started', 'completed', 'cancelled'])
export const workoutTagEnum = pgEnum('workout_tag', ['push', 'pull', 'legs', 'cardio'])

export const difficultyLevelValues = difficultyLevelEnum.enumValues
export const sessionStatusValues = sessionStatusEnum.enumValues
export const workoutTagValues = workoutTagEnum.enumValues

// ── Tables ─────────────────────────────────────────────────────

export const muscleGroups = pgTable('muscle_groups', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
})

export const exercises = pgTable('exercises', {
	id: serial('id').primaryKey(),
	exerciseName: varchar('exercise_name', { length: 255 }).notNull(),
	difficulty: difficultyLevelEnum('difficulty').notNull().default('easy'),
	primaryMuscleId: integer('primary_muscle_id').references(() => muscleGroups.id, { onDelete: 'set null' }),
	secondaryMuscleIds: integer('secondary_muscle_ids').array(),
	instructions: text('instructions').array(),
})

export const workouts = pgTable('workouts', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	tag: workoutTagEnum('tag'),
})

export const workoutExercises = pgTable('workout_exercises', {
	id: serial('id').primaryKey(),
	workoutId: integer('workout_id')
		.notNull()
		.references(() => workouts.id, { onDelete: 'cascade' }),
	exerciseId: integer('exercise_id')
		.notNull()
		.references(() => exercises.id, { onDelete: 'cascade' }),
})

export const workoutSession = pgTable('workout_session', {
	id: serial('id').primaryKey(),
	workoutId: integer('workout_id')
		.notNull()
		.references(() => workouts.id, { onDelete: 'cascade' }),
	startedAt: timestamp('started_at').notNull().defaultNow(),
	finishedAt: timestamp('finished_at'),
	status: sessionStatusEnum('status').notNull().default('started'),
	duration: integer('duration'),
})

export const exerciseSets = pgTable('exercise_sets', {
	id: serial('id').primaryKey(),
	sessionId: integer('session_id')
		.notNull()
		.references(() => workoutSession.id, { onDelete: 'cascade' }),
	exerciseId: integer('exercise_id')
		.notNull()
		.references(() => exercises.id, { onDelete: 'cascade' }),
	setNumber: integer('set_number').notNull(),
	repetitions: integer('repetitions').notNull(),
	weight: real('weight'),
	intensity: integer('intensity'),
	notes: text('notes'),
})

// ── Relations ──────────────────────────────────────────────────

export const muscleGroupsRelations = relations(muscleGroups, ({ many }) => ({
	exercises: many(exercises),
}))

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
	primaryMuscle: one(muscleGroups, {
		fields: [exercises.primaryMuscleId],
		references: [muscleGroups.id],
	}),
	workoutExercises: many(workoutExercises),
	exerciseSets: many(exerciseSets),
}))

export const workoutsRelations = relations(workouts, ({ many }) => ({
	workoutExercises: many(workoutExercises),
	sessions: many(workoutSession),
}))

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
	workout: one(workouts, {
		fields: [workoutExercises.workoutId],
		references: [workouts.id],
	}),
	exercise: one(exercises, {
		fields: [workoutExercises.exerciseId],
		references: [exercises.id],
	}),
}))

export const workoutSessionRelations = relations(workoutSession, ({ one, many }) => ({
	workout: one(workouts, {
		fields: [workoutSession.workoutId],
		references: [workouts.id],
	}),
	exerciseSets: many(exerciseSets),
}))

export const exerciseSetsRelations = relations(exerciseSets, ({ one }) => ({
	session: one(workoutSession, {
		fields: [exerciseSets.sessionId],
		references: [workoutSession.id],
	}),
	exercise: one(exercises, {
		fields: [exerciseSets.exerciseId],
		references: [exercises.id],
	}),
}))
