import FinishWorkoutButton from '@/components/shared/finish-workout-button'
import WorkoutExercisesList from '@/components/shared/workout-exercises-list'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default async function WorkoutSessionPage({ params }: { params: Promise<{ id: string }> }) {
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
	  exercise_name
	)
  `,
		)
		.eq('workout_id', session.workout_id)

	const exercises =
		workoutExercises?.map(item => ({
			id: item.exercise.id,
			name: item.exercise.exercise_name,
		})) ?? []

	return (
		<div>
			<div className='sticky top-0 flex items-center justify-between px-8 py-4'>
                <Button>
                    <ArrowLeft />
                </Button>
				<h1 className='font-semibold text-xl'>Workout {id}</h1>
				<FinishWorkoutButton sessionId={id} />
			</div>
			<div className='w-full space-y-6 p-4 max-w-7xl mx-auto'>
				<WorkoutExercisesList exercises={exercises} />
			</div>
		</div>
	)
}
