'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

export function StartWorkoutButton({ workoutId }: { workoutId: number }) {
	const supabase = createClient()
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	async function startWorkout() {
		try {
			setLoading(true)
			const { data, error } = await supabase
				.from('workout_session')
				.insert({
					workout_id: workoutId,
				})
				.select()
				.single()

			if (error) throw error

			router.push(`/workout-session/${data.id}`)
		} catch (err) {
			console.error('Failed to create session:', err)
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
