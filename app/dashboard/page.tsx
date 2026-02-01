import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
	const supabase = await createClient()

	const { data, error } = await supabase.auth.getClaims()
	if (error || !data?.claims) {
		redirect('/auth/login')
	}

	const { data: lastSession } = await supabase
		.from('workout_session')
		.select(
			`
    id,
    status,
    finished_at,
    workout_id,
    workout:workouts (
      id,
      name,
      description,
      tag
    )
  `,
		)
		.order('finished_at', { ascending: false })
		.limit(1)
		.single()

	return (
		<div className='w-full p-4 space-y-6'>
			<h1 className='text-2xl font-medium'>Dashboard</h1>

			<section className='rounded-lg border p-4'>
				<h2 className='text-lg font-medium mb-2'>Last completed workout</h2>

				{!lastSession ? (
					<p className='text-sm opacity-60'>No completed workouts yet.</p>
				) : (
					<div className='space-y-1'>
						<p className='font-medium'>{lastSession.workout.name}</p>

						{lastSession.workout.description && <p className='text-sm opacity-70'>{lastSession.workout.description}</p>}

						<div className='text-xs opacity-60 flex gap-3'>
							{lastSession.workout.tag && <span>Tag: {lastSession.workout.tag}</span>}
							{lastSession.finished_at && (
								<span>Finished: {new Date(lastSession.finished_at).toLocaleDateString()}</span>
							)}
						</div>
					</div>
				)}
			</section>
		</div>
	)
}
