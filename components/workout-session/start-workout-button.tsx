'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

export function StartWorkoutButton({ workoutId }: { workoutId: number }) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	async function startWorkout() {
		try {
			setLoading(true)
			router.push(`/workout-session/${workoutId}`)
		} catch (err) {
			console.error('Failed to start workout:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Button className='w-full flex gap-1 items-center justify-center' onClick={startWorkout} disabled={loading}>
			<Play />
			{loading ? 'Starting…' : 'Start workout'}
		</Button>
	)
}
