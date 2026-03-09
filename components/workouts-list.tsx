import { listWorkouts } from '@/lib/db/workouts'
import { WorkoutCard } from './workout-card'

export const WorkoutsList = async () => {
	const workouts = await listWorkouts()

	if (workouts.length === 0) {
		return <div className='text-sm opacity-70'>No workouts available</div>
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
			{workouts.map(workout => (
				<WorkoutCard key={workout.id} {...workout} />
			))}
		</div>
	)
}
