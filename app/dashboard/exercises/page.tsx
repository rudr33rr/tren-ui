import { ExercisesList } from '@/components/exercises-list'
import { ExerciseSearch } from '@/components/exercise-search'
import { AddExerciseModal } from '@/components/add-exercise-modal'
import { getMuscleGroups } from '@/lib/db/exercises'

export default async function ExercisesPage({
	searchParams,
}: {
	searchParams: Promise<{
		search?: string
		muscle?: string
	}>
}) {
	const { search, muscle } = await searchParams
	const muscleData = await getMuscleGroups()

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<h1 className='text-2xl font-medium'>Exercise Library</h1>
				<AddExerciseModal muscles={muscleData} />
			</div>
			<ExerciseSearch muscles={muscleData} />
			<ExercisesList search={search} muscle={muscle} />
		</div>
	)
}
