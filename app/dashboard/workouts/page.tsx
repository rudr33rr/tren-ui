import { AddWorkoutModal } from '@/components/add-workout-modal'
import { WorkoutsList } from '@/components/workouts-list'
import { listExerciseOptions } from '@/lib/db/exercises'

export default async function WorkoutsPage() {
	const exerciseOptions = await listExerciseOptions()

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<h1 className='text-2xl font-medium'>Workouts</h1>
				<AddWorkoutModal exerciseOptions={exerciseOptions} />
			</div>
			<WorkoutsList />
		</div>
	)
}
