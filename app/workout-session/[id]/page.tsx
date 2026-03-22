import WorkoutExercisesList from '@/components/workout-session/workout-exercises-list'
import WorkoutSessionHeader from '@/components/workout-session/workout-session-header'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function WorkoutSessionPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const supabase = await createClient()
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()

	if (userError || !user) {
		notFound()
	}

	const workoutId = Number(id)
	if (Number.isNaN(workoutId)) {
		notFound()
	}

	const { data: workout } = await supabase
		.from('workouts')
		.select('id, name')
		.eq('id', workoutId)
		.eq('user_id', user.id)
		.single()

	if (!workout) {
		notFound()
	}

	const { data: workoutExercises } = await supabase
		.from('workout_exercises')
		.select(
			`
	exercise:exercises (
	  id,
	  exercise_name
	)
  `,
		)
		.eq('workout_id', workout.id)

	const exercises =
		workoutExercises?.map(item => ({
			id: item.exercise.id,
			name: item.exercise.exercise_name,
		})) ?? []

	return (
		<div>
			<WorkoutSessionHeader workoutId={id} workoutLabel={workout.name} exercises={exercises} />
			<div className='w-full space-y-6 p-4 max-w-7xl mx-auto mb-20'>
				<WorkoutExercisesList exercises={exercises} />
			</div>
		</div>
	)
}
