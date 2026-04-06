import { getCurrentUserId } from '@/lib/auth'
import { fetchInitialWorkouts } from '@/data/workouts.server'
import { AddPlanForm } from '@/components/plans/add-plan-form'

export default async function AddPlanPage() {
	const userId = await getCurrentUserId()
	const workouts = await fetchInitialWorkouts(userId)

	return (
		<div className='w-full space-y-6 p-4 h-full'>
			<AddPlanForm workouts={workouts} />
		</div>
	)
}
