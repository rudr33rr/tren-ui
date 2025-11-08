'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { createClient } from '@/lib/supabase/client'

export default function FinishWorkoutButton({ sessionId }: { sessionId: string }) {
	const supabase = createClient()
	const [loading, setLoading] = useState(false)
	const [finished, setFinished] = useState(false)

	async function finishWorkout() {
		try {
			setLoading(true)
			const { error } = await supabase
				.from('workout_session')
				.update({ status: 'completed', finished_at: new Date().toISOString() })
				.eq('id', parseInt(sessionId))

			if (error) throw error

			setFinished(true)
		} catch (err) {
			console.error('Failed to finish workout:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Button onClick={finishWorkout} disabled={loading || finished} className='w-full'>
			{finished ? 'Workout Finished' : loading ? 'Finishing…' : 'Finish workout'}
		</Button>
	)
}
