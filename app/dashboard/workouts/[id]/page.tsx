'use client'

import FinishWorkoutButton from '@/components/shared/finish-workout-button'

export default function WorkoutPage(props: unknown) {
	const { params } = props as { params: { id: string } }

	return (
		<div>
			<h1>Workout {params.id}</h1>
			<FinishWorkoutButton sessionId={params.id} />
		</div>
	)
}
