import FinishWorkoutButton from '@/components/shared/finish-workout-button'
import { createClient } from '@/lib/supabase/server'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const supabase = createClient()

	const sessionId = Number(id)

	const { data: session, error: sessionError } = await (await supabase)
		.from('workout_session')
		.select('id, workout_id')
		.eq('id', sessionId)
		.single()

	if (!session) {
		throw new Error('Workout session not found')
	}

	const { data: workoutExercises, error: exercisesError } = await (
		await supabase
	)
		.from('workout_exercises')
		.select(
			`
	exercise:exercises (
	  id,
	  exercise_name,
	  difficulty
	)
  `,
		)
		.eq('workout_id', session.workout_id)

	return (
		<div>
			<h1>Workout {id}</h1>
			{workoutExercises?.map((item, index) => (
				<div key={item.exercise.id}>
					{index + 1}. {item.exercise.exercise_name}
				</div>
			))}
			<FinishWorkoutButton sessionId={id} />
		</div>
	)
}
