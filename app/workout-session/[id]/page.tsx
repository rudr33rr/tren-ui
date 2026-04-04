import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { workouts, workoutExercises } from '@/db/schema'
import { fetchMuscleGroups } from '@/data/exercises.server'
import WorkoutExercisesList from '@/components/workout-session/workout-exercises-list'
import WorkoutSessionHeader from '@/components/workout-session/workout-session-header'

export default async function WorkoutSessionPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const workoutId = Number(id)
	if (Number.isNaN(workoutId)) {
		notFound()
	}

	const workout = await db.query.workouts.findFirst({
		where: eq(workouts.id, workoutId),
		columns: { id: true, name: true },
	})

	if (!workout) {
		notFound()
	}

	const workoutExercisesData = await db.query.workoutExercises.findMany({
		where: eq(workoutExercises.workoutId, workoutId),
		with: {
			exercise: {
				columns: {
					id: true,
					exerciseName: true,
					trackingType: true,
					weightType: true,
					isUnilateral: true,
				},
			},
		},
	})

	const exercises = workoutExercisesData.map(item => ({
		id: item.exercise.id,
		name: item.exercise.exerciseName,
		trackingType: item.exercise.trackingType,
		weightType: item.exercise.weightType,
		isUnilateral: item.exercise.isUnilateral,
	}))

	const { muscles, error: musclesError } = await fetchMuscleGroups()

	return (
		<div>
			<WorkoutSessionHeader workoutId={id} workoutLabel={workout.name} />
			<div className='w-full space-y-6 p-4 max-w-7xl mx-auto mb-20'>
				<WorkoutExercisesList exercises={exercises} muscles={muscles} musclesError={musclesError} />
			</div>
		</div>
	)
}
