import { createClient } from '@/lib/supabase/server'
import { fetchInitialWorkouts } from '../queries/workouts.server'
import { WorkoutsInfiniteList } from './workouts-infinite-list'

const PAGE_SIZE = 20

export const WorkoutsList = async () => {
	const supabase = await createClient()
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()

	if (userError || !user) {
		return <div className='text-sm text-destructive'>Error: User not authenticated.</div>
	}

	let workouts: Awaited<ReturnType<typeof fetchInitialWorkouts>>
	try {
		workouts = await fetchInitialWorkouts(supabase, user.id)
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return <div className='text-sm text-destructive'>Error: {message}</div>
	}

	return (
		<WorkoutsInfiniteList initialWorkouts={workouts} initialHasMore={workouts.length === PAGE_SIZE} userId={user.id} />
	)
}
