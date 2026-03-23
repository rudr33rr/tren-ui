import { createClient } from '@/lib/supabase/server'
import { WorkoutsInfiniteList } from '@/components/workout/workouts-infinite-list'
import type { WorkoutCardData } from '@/types/view'
import type { Tables } from '@/types/supabase'

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

	const { data: workoutsData, error } = await supabase
		.from('workouts')
		.select('id, name, description, workout_exercises(id)')
		.eq('user_id', user.id)
		.order('id', { ascending: true })
		.range(0, PAGE_SIZE - 1)

	if (error) {
		return <div className='text-sm text-destructive'>Error: {error.message}</div>
	}

	const workouts: WorkoutCardData[] = (
		(workoutsData ?? []) as Array<
			Tables<'workouts'> & {
				workout_exercises: { id: number }[] | null
			}
		>
	).map(w => ({
		id: w.id,
		name: w.name,
		description: w.description,
		exerciseCount: Array.isArray(w.workout_exercises) ? w.workout_exercises.length : 0,
	}))

	return <WorkoutsInfiniteList initialWorkouts={workouts} initialHasMore={workouts.length === PAGE_SIZE} userId={user.id} />
}
