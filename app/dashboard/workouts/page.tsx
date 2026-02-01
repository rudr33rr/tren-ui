import { AddWorkoutModal } from '@/components/add-workout-modal'
import { WorkoutsList } from '@/components/workouts-list'

export default async function WorkoutsPage() {
	return (
		<div className='w-full space-y-6 p-4'>
			<div className='flex w-full justify-between'>
				<h1 className='text-2xl font-medium'>Workouts</h1>
				<AddWorkoutModal />
			</div>
			<p>Create and manage your training routines</p>
			<WorkoutsList />
		</div>
	)
}
