import { ExercisesList } from '@/components/exercises-list'
import { ExerciseSearch } from '@/components/exercise-search'
import { createClient } from '@/lib/supabase/server'

export default async function ExcersisesPage({
	searchParams,
}: {
	searchParams: Promise<{
		search?: string
		muscle?: string
	}>
}) {
	const supabse = await createClient()
	const { search, muscle } = await searchParams

	const { data: muscleData, error } = await supabse.from('muscle_groups').select('id, name').order('name')

	const musclesError = Boolean(error)

	return (
		<div className='w-full space-y-6 p-4'>
			<h1 className='text-2xl font-medium'>Exercise Library</h1>
			<p>Browse and learn proper form for exercises</p>
			<ExerciseSearch muscles={muscleData ?? []} musclesError={musclesError} />
			<ExercisesList search={search} muscle={muscle} />
		</div>
	)
}
