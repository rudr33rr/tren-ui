'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { finishWorkoutAction } from '@/app/dashboard/workouts/actions'
import { Button } from '../ui/button'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'
import { Save } from 'lucide-react'

export function FinishWorkoutButton({ sessionId }: { sessionId: number }) {
	const router = useRouter()
	const exercises = useWorkoutSessionStore(state => state.exercises)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function finishWorkout() {
		try {
			setLoading(true)
			setError(null)

			const result = await finishWorkoutAction({
				sessionId,
				exercises: Object.values(exercises).map(exercise => ({
					exerciseId: exercise.exerciseId,
					sets: exercise.sets.map(set => ({
						reps: set.reps,
						weight: typeof set.weight === 'number' ? set.weight : null,
						intensity: typeof set.intensity === 'number' ? set.intensity : null,
					})),
					notes: exercise.notes ?? null,
				})),
			})

			if (!result.ok) {
				setError(result.error ?? 'Failed to save workout')
				return
			}

			useWorkoutSessionStore.getState().clear()
			router.replace('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to finish workout:', err)
			setError('Failed to save workout')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='space-y-2'>
			<Button onClick={finishWorkout} disabled={loading}>
				<Save className='ml-1 h-4 w-4' />
				{loading ? 'Saving…' : 'Save workout'}
			</Button>
			{error ? <p className='text-sm text-destructive'>{error}</p> : null}
		</div>
	)
}
