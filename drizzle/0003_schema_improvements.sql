ALTER TABLE "exercise_sets" DROP CONSTRAINT "exercise_sets_session_id_workout_session_id_fk";
--> statement-breakpoint
ALTER TABLE "exercise_sets" DROP CONSTRAINT "exercise_sets_exercise_id_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_primary_muscle_id_muscle_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_workout_id_workouts_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_session" DROP CONSTRAINT "workout_session_workout_id_workouts_id_fk";
--> statement-breakpoint
ALTER TABLE "exercise_sets" ALTER COLUMN "weight" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "exercise_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_session" ALTER COLUMN "started_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "workout_session" ALTER COLUMN "started_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_session_id_workout_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_primary_muscle_id_muscle_groups_id_fk" FOREIGN KEY ("primary_muscle_id") REFERENCES "public"."muscle_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;