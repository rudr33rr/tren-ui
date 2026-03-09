import { FinishWorkoutButton } from '@/components/shared/finish-workout-button'
import { WorkoutExerciseCard } from '@/components/shared/workout-exercise-card'
import { getWorkoutSessionPageData } from '@/lib/db/workouts'
import { Calendar } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const sessionId = Number(id)

	if (!Number.isInteger(sessionId)) {
		notFound()
	}

	const session = await getWorkoutSessionPageData(sessionId)

	if (!session) {
		notFound()
	}

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='flex items-center justify-between'>
				<div className='flex gap-4'>
					<h1 className='font-semibold text-xl'>{session.workoutName}</h1>
					<span className='flex items-center gap-1 text-xs text-muted-foreground'>
						<Calendar className='h-3 w-3' />
						{session.startedAt.toLocaleDateString()}
					</span>
				</div>
				<FinishWorkoutButton sessionId={session.sessionId} />
			</div>

			{session.exercises.length === 0 ? (
				<p className='text-sm opacity-70'>No exercises loaded</p>
			) : (
				<div className='space-y-6'>
					{session.exercises.map(exercise => (
						<WorkoutExerciseCard key={exercise.id} exerciseId={exercise.id} exerciseName={exercise.name} />
					))}
				</div>
			)}
		</div>
	)
}
