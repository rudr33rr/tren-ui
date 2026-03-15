import FinishWorkoutButton from '@/components/shared/finish-workout-button'
import WorkoutExerciseCard from '@/components/shared/workout-exercise-card'
import { createClient } from '@/lib/supabase/server'
import { Calendar } from 'lucide-react'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const supabase = createClient()

	const sessionId = Number(id)

	const { data: session } = await (await supabase)
		.from('workout_session')
		.select('id, workout_id')
		.eq('id', sessionId)
		.single()

	if (!session) {
		throw new Error('Workout session not found')
	}

	const { data: workoutExercises } = await (
		await supabase
	)
		.from('workout_exercises')
		.select(
			`
	exercise:exercises (
	  id,
	  exercise_name,
	  difficulty
	)
  `,
		)
		.eq('workout_id', session.workout_id)

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

			{workoutExercises?.map(item => (
				<WorkoutExerciseCard
					key={item.exercise.id}
					exercise={{
						id: item.exercise.id,
						name: item.exercise.exercise_name,
						difficulty: item.exercise.difficulty,
					}}
				/>
			))}
		</div>
	)
}
