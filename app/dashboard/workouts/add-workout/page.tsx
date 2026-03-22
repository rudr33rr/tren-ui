import { AddWorkoutExerciseDrawer } from '@/components/workout/builder/add-workout-exercise-drawer'
import { AddWorkoutNameInput } from '@/components/workout/builder/add-workout-name-input'
import { AddWorkoutSaveButton } from '@/components/workout/builder/add-workout-save-button'
import { AddWorkoutSelectedExercises } from '@/components/workout/builder/add-workout-selected-exercises'
import { isExerciseType } from '@/lib/exerciseTypeIcons'
import { createClient } from '@/lib/supabase/server'
import type { ExerciseCardData } from '@/types/view'

export default async function NewWorkoutPage({
	searchParams,
}: {
	searchParams: Promise<{
		search?: string
		muscle?: string
		type?: string
	}>
}) {
	const supabase = await createClient()
	const { search, muscle, type } = await searchParams

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

	const musclesError = Boolean(musclesFetchError)

	const musclesById = new Map<number, { id: number; name: string }>(
		(musclesData ?? []).map(m => [m.id, { id: m.id, name: m.name }]),
	)

	const exercises: ExerciseCardData[] = (exercisesData ?? []).map(item => {
		const primary = Array.isArray(item.primaryMuscle) ? (item.primaryMuscle[0] ?? null) : (item.primaryMuscle ?? null)

		const secondaryMusclesObjects = Array.isArray(item.secondary_muscle_ids)
			? item.secondary_muscle_ids
					.map(mid => musclesById.get(mid))
					.filter((x): x is { id: number; name: string } => Boolean(x))
			: []

		return {
			id: item.id,
			name: item.exercise_name,
			primaryMuscle: primary ? { id: primary.id, name: primary.name } : null,
			secondaryMuscles: secondaryMusclesObjects,
			type: item.type,
		}
	})

	return (
		<div className='w-full space-y-6 p-4 h-full'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-medium'>New Workout</h1>
				<AddWorkoutSaveButton />
			</div>
			<div className='flex flex-col gap-2'>
				<AddWorkoutNameInput />
				<AddWorkoutSelectedExercises />
			</div>
			<div className='flex justify-end'>
				<AddWorkoutExerciseDrawer
					muscles={musclesData ?? []}
					musclesError={musclesError}
					exercises={exercises}
					exercisesErrorMessage={exercisesError?.message}
				/>
			</div>
		</div>
	)
}
