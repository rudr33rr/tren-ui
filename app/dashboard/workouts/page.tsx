import { AddWorkoutModal } from '@/components/add-workout-modal'
import { WorkoutsList } from '@/components/workouts-list'

export default async function WorkoutsPage() {
	return (
		<>
			<div className='flex w-full justify-between'>
				<h1 className='text-2xl font-medium'>Workouts</h1>
				<AddWorkoutModal />
			</div>
			<p>Create and manage your training routines</p>
			<WorkoutsList />
		</>
	)
}
