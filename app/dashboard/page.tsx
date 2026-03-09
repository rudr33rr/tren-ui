import { Badge } from '@/components/ui/badge'
import { getLastCompletedWorkout } from '@/lib/db/workouts'

export default async function DashboardPage() {
	const lastCompletedWorkout = await getLastCompletedWorkout()

	return (
		<div className='w-full p-4 space-y-6'>
			<h1 className='text-2xl font-medium'>Dashboard</h1>

			<section className='rounded-lg border p-4'>
				<h2 className='text-lg font-medium mb-2'>Last completed workout</h2>
				{lastCompletedWorkout ? (
					<div className='space-y-2'>
						<div className='flex items-center gap-3'>
							<p className='text-base font-medium'>{lastCompletedWorkout.workoutName}</p>
							{lastCompletedWorkout.tag ? <Badge variant='outline'>{lastCompletedWorkout.tag}</Badge> : null}
						</div>
						<p className='text-sm opacity-70'>
							Finished {lastCompletedWorkout.finishedAt?.toLocaleDateString() ?? 'recently'}
							{typeof lastCompletedWorkout.duration === 'number' ? ` • ${lastCompletedWorkout.duration} min` : ''}
						</p>
					</div>
				) : (
					<p className='text-sm opacity-60'>No completed workouts yet.</p>
				)}
			</section>
		</div>
	)
}
