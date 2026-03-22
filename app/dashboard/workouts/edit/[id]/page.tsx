import { notFound } from 'next/navigation'
import { EditWorkoutForm } from '@/components/workout/builder/edit-workout-form'
import { createClient } from '@/lib/supabase/server'

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const workoutId = Number(id)
	if (Number.isNaN(workoutId)) {
		notFound()
	}

	const supabase = await createClient()
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()

	if (userError || !user) {
		notFound()
	}

	const { data: workout, error } = await supabase
		.from('workouts')
		.select('id, name, description')
		.eq('id', workoutId)
		.eq('user_id', user.id)
		.single()

	if (error || !workout) {
		notFound()
	}

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='space-y-1'>
				<h1 className='text-2xl font-medium'>Edit Workout</h1>
			</div>
			<EditWorkoutForm workout={workout} />
		</div>
	)
}
