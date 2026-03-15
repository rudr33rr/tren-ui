import { notFound } from 'next/navigation'
import { EditWorkoutForm } from '@/components/edit-workout-form'
import { createClient } from '@/lib/supabase/server'

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const workoutId = Number(id)
	if (Number.isNaN(workoutId)) {
		notFound()
	}

	const supabase = await createClient()

	const { data: workout, error } = await supabase
		.from('workouts')
		.select('id, name, description')
		.eq('id', workoutId)
		.single()

	if (error || !workout) {
		notFound()
	}

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='space-y-1'>
				<h1 className='text-2xl font-medium'>Edit Workout</h1>
				<p className='text-sm text-muted-foreground'>Update workout details and save your changes.</p>
			</div>
			<EditWorkoutForm workout={workout} />
		</div>
	)
}
