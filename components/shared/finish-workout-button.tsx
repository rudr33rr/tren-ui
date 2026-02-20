'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { createClient } from '@/lib/supabase/client'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'
import { Save } from 'lucide-react'

export default function FinishWorkoutButton({ sessionId }: { sessionId: string }) {
	const supabase = createClient()
	const [loading, setLoading] = useState(false)
	const [finished, setFinished] = useState(false)

	async function finishWorkout() {
		try {
			setLoading(true)

			const exercises = useWorkoutSessionStore.getState().exercises

			const rows = Object.values(exercises).flatMap(ex =>
				ex.sets.map((set, index) => ({
					session_id: Number(sessionId),
					exercise_id: ex.exerciseId,
					set_number: index + 1,
					repetitions: set.reps,
					weight: set.weight ?? null,
					intensity: set.intensity ?? 5,
					notes: ex.notes ?? '',
				})),
			)

			if (rows.length > 0) {
				const { error: exerciseError } = await supabase.from('exercise_sets').insert(rows)

				if (exerciseError) throw exerciseError
			}

			const { error } = await supabase
				.from('workout_session')
				.update({
					status: 'completed',
					finished_at: new Date().toISOString(),
				})
				.eq('id', Number(sessionId))

			if (error) throw error
			useWorkoutSessionStore.getState().clear()
			setFinished(true)
		} catch (err) {
			console.error('Failed to finish workout:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Button onClick={finishWorkout} disabled={loading || finished}>
			<Save className='ml-1 h-4 w-4' />
			{finished ? 'Workout Saved' : loading ? 'Saving…' : 'Save workout'}
		</Button>
	)
}
