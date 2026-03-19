import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const supabase = await createClient()

	const exerciseId = Number(id)
	if (Number.isNaN(exerciseId)) {
		notFound()
	}

	const { data: exercise, error } = await supabase
		.from('exercises')
		.select(
			`
        id,
        exercise_name
      `,
		)
		.eq('id', exerciseId)
		.single()

	if (error || !exercise) {
		notFound()
	}

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='lg:col-span-2'>
				<h1 className='text-2xl font-medium'>{exercise.exercise_name}</h1>
			</div>
		</div>
	)
}
