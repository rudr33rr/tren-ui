import { createClient } from '@/lib/supabase/server'
import { ExerciseSearch } from '@/features/exercises/components/exercise-search'
import { ExercisesInfiniteList } from '@/features/exercises/components/exercises-infinite-list'
import { fetchMuscleGroups, fetchInitialExercises } from '@/features/exercises/queries/exercises.server'

const PAGE_SIZE = 20

export default async function ExercisesPage({
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

	const { muscles, error: musclesError } = await fetchMuscleGroups(supabase)
	const musclesById = new Map(muscles.map(m => [m.id, m]))

	let exercises: Awaited<ReturnType<typeof fetchInitialExercises>>
	try {
		exercises = await fetchInitialExercises(supabase, { search, muscle, type }, musclesById)
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return <div className='text-sm text-destructive'>Error: {message}</div>
	}

	return (
		<div className='flex flex-col gap-2 p-4'>
			<h1 className='text-2xl font-medium'>Exercise Library</h1>
			<ExerciseSearch muscles={muscles} musclesError={musclesError} />
			<ExercisesInfiniteList
				key={`${search ?? ''}-${muscle ?? ''}-${type ?? ''}`}
				initialExercises={exercises}
				initialHasMore={exercises.length === PAGE_SIZE}
				search={search}
				muscle={muscle}
				type={type}
			/>
		</div>
	)
}
