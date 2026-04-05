import { getCurrentUserId } from '@/lib/auth'
import { fetchInitialWorkouts } from '@/data/workouts.server'
import { WorkoutsInfiniteList } from './workouts-infinite-list'

const PAGE_SIZE = 20

export const WorkoutsList = async () => {
	const userId = await getCurrentUserId()

	let workouts: Awaited<ReturnType<typeof fetchInitialWorkouts>>
	try {
		workouts = await fetchInitialWorkouts(userId)
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return <div className='text-sm text-destructive'>Error: {message}</div>
	}

	return <WorkoutsInfiniteList key={workouts.map(w => w.id).join(',')} initialWorkouts={workouts} initialHasMore={workouts.length === PAGE_SIZE} />
}
