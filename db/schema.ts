import { relations } from 'drizzle-orm'
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	numeric,
} from 'drizzle-orm/pg-core'

// Enums
export const exerciseTrackingTypeEnum = pgEnum('exercise_tracking_type', ['reps', 'duration'])
export const exerciseTypeEnum = pgEnum('exercise_type', [
	'strength',
	'cardio',
	'flexibility',
	'core',
	'plyometric',
])
export const exerciseWeightTypeEnum = pgEnum('exercise_weight_type', ['weighted', 'bodyweight'])
export const difficultyLevelEnum = pgEnum('difficulty_level', ['easy', 'intermediate', 'hard'])

// Tables
export const muscleGroups = pgTable('muscle_groups', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
})

export const exercises = pgTable('exercises', {
	id: serial('id').primaryKey(),
	exerciseName: text('exercise_name'),
	primaryMuscleId: integer('primary_muscle_id').references(() => muscleGroups.id),
	secondaryMuscleIds: integer('secondary_muscle_ids').array(),
	trackingType: exerciseTrackingTypeEnum('tracking_type').notNull().default('reps'),
	type: exerciseTypeEnum('type'),
	weightType: exerciseWeightTypeEnum('weight_type').notNull().default('weighted'),
	isUnilateral: boolean('is_unilateral').notNull().default(false),
})

export const workouts = pgTable('workouts', {
	id: serial('id').primaryKey(),
	userId: text('user_id'),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const workoutExercises = pgTable('workout_exercises', {
	id: serial('id').primaryKey(),
	workoutId: integer('workout_id')
		.notNull()
		.references(() => workouts.id),
	exerciseId: integer('exercise_id')
		.notNull()
		.references(() => exercises.id),
	exerciseOrder: integer('exercise_order').notNull(),
})

export const workoutPlans = pgTable('workout_plans', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	name: text('name').notNull(),
	isActive: boolean('is_active').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const workoutPlanDays = pgTable('workout_plan_days', {
	id: serial('id').primaryKey(),
	planId: integer('plan_id')
		.notNull()
		.references(() => workoutPlans.id),
	workoutId: integer('workout_id')
		.notNull()
		.references(() => workouts.id),
	dayIndex: integer('day_index').notNull(),
})

export const workoutSession = pgTable('workout_session', {
	id: serial('id').primaryKey(),
	userId: text('user_id'),
	workoutId: integer('workout_id')
		.notNull()
		.references(() => workouts.id),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const exerciseSession = pgTable('exercise_session', {
	id: serial('id').primaryKey(),
	sessionId: integer('session_id')
		.notNull()
		.references(() => workoutSession.id),
	exerciseId: integer('exercise_id')
		.notNull()
		.references(() => exercises.id),
	userId: text('user_id'),
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const exerciseSet = pgTable('exercise_set', {
	id: serial('id').primaryKey(),
	sessionId: integer('session_id')
		.notNull()
		.references(() => exerciseSession.id),
	userId: text('user_id'),
	reps: integer('reps'),
	// numeric columns come back as strings from neon-http; use Number() where arithmetic is needed
	weight: numeric('weight'),
	durationSec: integer('duration_sec'),
	intensity: integer('intensity'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Relations
export const muscleGroupsRelations = relations(muscleGroups, ({ many }) => ({
	exercises: many(exercises),
}))

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
	primaryMuscle: one(muscleGroups, {
		fields: [exercises.primaryMuscleId],
		references: [muscleGroups.id],
	}),
	workoutExercises: many(workoutExercises),
	exerciseSessions: many(exerciseSession),
}))

export const workoutsRelations = relations(workouts, ({ many }) => ({
	exercises: many(workoutExercises),
	sessions: many(workoutSession),
	planDays: many(workoutPlanDays),
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

export const workoutPlansRelations = relations(workoutPlans, ({ many }) => ({
	days: many(workoutPlanDays),
}))

export const workoutPlanDaysRelations = relations(workoutPlanDays, ({ one }) => ({
	plan: one(workoutPlans, {
		fields: [workoutPlanDays.planId],
		references: [workoutPlans.id],
	}),
	workout: one(workouts, {
		fields: [workoutPlanDays.workoutId],
		references: [workouts.id],
	}),
}))

export const workoutSessionRelations = relations(workoutSession, ({ one, many }) => ({
	workout: one(workouts, {
		fields: [workoutSession.workoutId],
		references: [workouts.id],
	}),
	exerciseSessions: many(exerciseSession),
}))

export const exerciseSessionRelations = relations(exerciseSession, ({ one, many }) => ({
	session: one(workoutSession, {
		fields: [exerciseSession.sessionId],
		references: [workoutSession.id],
	}),
	exercise: one(exercises, {
		fields: [exerciseSession.exerciseId],
		references: [exercises.id],
	}),
	sets: many(exerciseSet),
}))

export const exerciseSetRelations = relations(exerciseSet, ({ one }) => ({
	exerciseSession: one(exerciseSession, {
		fields: [exerciseSet.sessionId],
		references: [exerciseSession.id],
	}),
}))
