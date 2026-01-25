import FinishWorkoutButton from '@/components/shared/finish-workout-button'
import { createClient } from '@/lib/supabase/server'
import { ExerciseSetsForm } from '@/components/shared/exercise-sets-form'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const supabase = createClient()

	const sessionId = Number(id)

	const { data: session} = await (await supabase)
		.from('workout_session')
		.select('id, workout_id')
		.eq('id', sessionId)
		.single()

	if (!session) {
		throw new Error('Workout session not found')
	}

	const { data: workoutExercises } = await (
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
			{workoutExercises?.map((item) => (
				<div key={item.exercise.id} className='flex items-center gap-2'>
					{item.exercise.exercise_name}
					<ExerciseSetsForm  />
				</div>
			))}
			<FinishWorkoutButton sessionId={id} />
		</div>
	)
}
