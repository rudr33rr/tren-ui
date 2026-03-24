import WorkoutExercisesList from '@/features/workout-session/components/workout-exercises-list'
import WorkoutSessionHeader from '@/features/workout-session/components/workout-session-header'
import { createClient } from '@/lib/supabase/server'
import { fetchMuscleGroups } from '@/features/exercises/queries/exercises.server'
import { notFound } from 'next/navigation'

export default async function WorkoutSessionPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
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

	const { muscles, error: musclesError } = await fetchMuscleGroups(supabase)

	return (
		<div>
			<WorkoutSessionHeader workoutId={id} workoutLabel={workout.name} />
			<div className='w-full space-y-6 p-4 max-w-7xl mx-auto mb-20'>
				<WorkoutExercisesList exercises={exercises} muscles={muscles} musclesError={musclesError} />
			</div>
		</div>
	)
}
