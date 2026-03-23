import WorkoutExercisesList from '@/components/workout-session/workout-exercises-list'
import WorkoutSessionHeader from '@/components/workout-session/workout-session-header'
import { isExerciseType } from '@/lib/exerciseTypeIcons'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { ExerciseCardData } from '@/types/view'

export default async function WorkoutSessionPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<{ search?: string; muscle?: string; type?: string }>
}) {
	const { id } = await params
	const { search, muscle, type } = await searchParams
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

	const { data: musclesData, error: musclesFetchError } = await supabase
		.from('muscle_groups')
		.select('id, name')
		.order('name')

	let exercisesQuery = supabase.from('exercises').select(
		`
      id,
      exercise_name,
      primaryMuscle:muscle_groups!exercises_primary_muscle_id_fkey ( id, name ),
      secondary_muscle_ids,
      type
    `,
	)

	if (search) {
		exercisesQuery = exercisesQuery.ilike('exercise_name', `%${search}%`)
	}

	if (muscle) {
		exercisesQuery = exercisesQuery.eq('primary_muscle_id', Number(muscle))
	}

	if (type && isExerciseType(type)) {
		exercisesQuery = exercisesQuery.eq('type', type)
	}

	const { data: exercisesData, error: exercisesError } = await exercisesQuery.order('id', { ascending: true })

	const musclesById = new Map<number, { id: number; name: string }>(
		(musclesData ?? []).map(m => [m.id, { id: m.id, name: m.name }]),
	)

	const allExercises: ExerciseCardData[] = (exercisesData ?? []).map(item => {
		const primary = Array.isArray(item.primaryMuscle) ? (item.primaryMuscle[0] ?? null) : (item.primaryMuscle ?? null)

		const secondaryMuscles = Array.isArray(item.secondary_muscle_ids)
			? item.secondary_muscle_ids
					.map(mid => musclesById.get(mid))
					.filter((x): x is { id: number; name: string } => Boolean(x))
			: []

		return {
			id: item.id,
			name: item.exercise_name,
			primaryMuscle: primary ? { id: primary.id, name: primary.name } : null,
			secondaryMuscles,
			type: item.type,
		}
	})

	return (
		<div>
			<WorkoutSessionHeader workoutId={id} workoutLabel={workout.name} />
			<div className='w-full space-y-6 p-4 max-w-7xl mx-auto mb-20'>
				<WorkoutExercisesList
					exercises={exercises}
					availableExercises={allExercises}
					muscles={musclesData ?? []}
					musclesError={Boolean(musclesFetchError)}
					exercisesErrorMessage={exercisesError?.message}
				/>
			</div>
		</div>
	)
}
