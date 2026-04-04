import { notFound } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { workouts } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'
import { EditWorkoutForm } from '@/components/workouts/builder/edit-workout-form'

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const workoutId = Number(id)
	if (Number.isNaN(workoutId)) {
		notFound()
	}

	const userId = await getCurrentUserId()

	const workout = await db.query.workouts.findFirst({
		where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
		columns: { id: true, name: true, description: true },
	})

	if (!workout) {
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
