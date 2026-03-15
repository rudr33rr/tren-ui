import Link from 'next/link'
import { ExerciseCard } from '@/components/exercise-card'
import { ExerciseSearch } from '@/components/exercise-search'
import { isExerciseType } from '@/lib/exerciseTypeIcons'
import { createClient } from '@/lib/supabase/server'
import type { ExerciseCardData } from '@/types/view'

export default async function ExcersisesPage({
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

	const { data: muscleData, error: musclesFetchError } = await supabase
		.from('muscle_groups')
		.select('id, name')
		.order('name')

	let exercisesQuery = supabase.from('exercises').select(
		`
      id,
      exercise_name,
      difficulty,
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

	const { data: exercisesData, error: exercisesError } = await exercisesQuery.order('id', {
		ascending: true,
	})

	const musclesError = Boolean(musclesFetchError)

	if (exercisesError) {
		return <div className='text-sm text-destructive'>Error: {exercisesError.message}</div>
	}

	const musclesById = new Map<number, { id: number; name: string }>(
		(muscleData ?? []).map(m => [m.id, { id: m.id, name: m.name }]),
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
			difficulty: item.difficulty,
			primaryMuscle: primary ? { id: primary.id, name: primary.name } : null,
			secondaryMuscles: secondaryMusclesObjects,
			type: item.type,
		}
	})

	return (
		<div className='w-full space-y-6 p-4'>
			<h1 className='text-2xl font-medium'>Exercise Library</h1>
			<p>Browse and learn proper form for exercises</p>
			<ExerciseSearch muscles={muscleData ?? []} musclesError={musclesError} />
			{exercises.length === 0 ? (
				<div className='text-sm opacity-70'>No exercises available</div>
			) : (
				<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-4'>
					{exercises.map(ex => (
						<Link key={ex.id} href={`/dashboard/exercises/${ex.id}`} className='block'>
							<ExerciseCard exercise={ex} />
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
