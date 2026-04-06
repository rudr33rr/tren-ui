import { notFound } from 'next/navigation'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '@/db'
import { workouts, workoutExercises, exercises, muscleGroups } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'
import { AddWorkoutExerciseDrawer } from '@/components/workouts/builder/add-workout-exercise-drawer'
import { AddWorkoutNameInput } from '@/components/workouts/builder/add-workout-name-input'
import { AddWorkoutSelectedExercises } from '@/components/workouts/builder/add-workout-selected-exercises'
import { EditWorkoutInitializer } from '@/components/workouts/builder/edit-workout-initializer'
import { EditWorkoutSaveButton } from '@/components/workouts/builder/edit-workout-save-button'
import { fetchMuscleGroups } from '@/data/exercises.server'

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const workoutId = Number(id)
	if (Number.isNaN(workoutId)) {
		notFound()
	}

	const userId = await getCurrentUserId()

	const workout = await db.query.workouts.findFirst({
		where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
		columns: { id: true, name: true },
	})

	if (!workout) {
		notFound()
	}

	const workoutExerciseRows = await db
		.select({
			id: exercises.id,
			name: exercises.exerciseName,
			type: exercises.type,
			trackingType: exercises.trackingType,
			weightType: exercises.weightType,
			isUnilateral: exercises.isUnilateral,
			primaryMuscleId: muscleGroups.id,
			primaryMuscleName: muscleGroups.name,
			exerciseOrder: workoutExercises.exerciseOrder,
		})
		.from(workoutExercises)
		.innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
		.leftJoin(muscleGroups, eq(exercises.primaryMuscleId, muscleGroups.id))
		.where(eq(workoutExercises.workoutId, workoutId))
		.orderBy(asc(workoutExercises.exerciseOrder))

	const initialExercises = workoutExerciseRows.map(row => ({
		id: row.id,
		name: row.name,
		type: row.type,
		trackingType: row.trackingType,
		weightType: row.weightType,
		isUnilateral: row.isUnilateral,
		primaryMuscle: row.primaryMuscleId ? { id: row.primaryMuscleId, name: row.primaryMuscleName! } : null,
		secondaryMuscles: [],
	}))

	const { muscles, error: musclesError } = await fetchMuscleGroups()

	return (
		<div className='w-full space-y-6 p-4 h-full'>
			<EditWorkoutInitializer name={workout.name} exercises={initialExercises} />
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-medium'>Edit Workout</h1>
				<EditWorkoutSaveButton workoutId={workout.id} />
			</div>
			<div className='flex flex-col gap-2'>
				<AddWorkoutNameInput />
				<AddWorkoutSelectedExercises />
			</div>
			<div className='flex justify-end'>
				<AddWorkoutExerciseDrawer muscles={muscles} musclesError={musclesError} />
			</div>
		</div>
	)
}
