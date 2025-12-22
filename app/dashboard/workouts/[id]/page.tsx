import FinishWorkoutButton from '@/components/shared/finish-workout-button'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	return (
		<div>
			<h1>Workout {id}</h1>
			<FinishWorkoutButton sessionId={id} />
		</div>
	)
}
