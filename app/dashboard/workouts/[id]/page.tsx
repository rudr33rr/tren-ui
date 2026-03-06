import FinishWorkoutButton from '@/components/shared/finish-workout-button'
import { Calendar } from 'lucide-react'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	// TODO: Replace with Drizzle queries
	const workoutExercises: { exercise: { id: number; exercise_name: string; difficulty: string } }[] = []

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='flex items-center justify-between'>
				<div className='flex gap-4'>
					<h1 className='font-semibold text-xl'>Workout {id}</h1>
					<span className='flex items-center gap-1 text-xs text-muted-foreground'>
						<Calendar className='h-3 w-3' />
						{new Date().toLocaleDateString()}
					</span>
				</div>
				<FinishWorkoutButton sessionId={id} />
			</div>

			{workoutExercises.length === 0 && <p className='text-sm opacity-70'>No exercises loaded</p>}
		</div>
	)
}
