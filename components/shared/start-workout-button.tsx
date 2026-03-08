'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startWorkoutAction } from '@/app/dashboard/workouts/actions'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'
import { Button } from '../ui/button'
import { Play } from 'lucide-react'

export function StartWorkoutButton({ workoutId }: { workoutId: number }) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function startWorkout() {
		try {
			setLoading(true)
			setError(null)

			const result = await startWorkoutAction(workoutId)

			if (!result.ok || result.sessionId === null) {
				setError(result.error ?? 'Failed to start workout')
				return
			}

			useWorkoutSessionStore.getState().clear()
			router.push(`/dashboard/workouts/${result.sessionId}`)
		} catch (err) {
			console.error('Failed to create session:', err)
			setError('Failed to start workout')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='w-full space-y-2'>
			<Button className='w-full flex gap-1 items-center justify-center' onClick={startWorkout} disabled={loading}>
				<Play />
				{loading ? 'Starting…' : 'Start workout'}
			</Button>
			{error ? <p className='text-sm text-destructive'>{error}</p> : null}
		</div>
	)
}
