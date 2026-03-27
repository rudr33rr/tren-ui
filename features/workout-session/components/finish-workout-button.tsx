'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { useWorkoutSessionStore } from '@/stores/workout-session.store'
import { saveSession } from '../actions/session.client'
import { Save } from 'lucide-react'

type FinishWorkoutButtonProps = {
	workoutId: string
	canSave?: boolean
}

export default function FinishWorkoutButton({ workoutId, canSave = true }: FinishWorkoutButtonProps) {
	const router = useRouter()
	const supabase = createClient()
	const [loading, setLoading] = useState(false)
	const [finished, setFinished] = useState(false)

	async function finishWorkout() {
		if (!canSave || loading || finished) return

		try {
			setLoading(true)
			const exercises = Object.values(useWorkoutSessionStore.getState().exercises)
			await saveSession(supabase, { workoutId: Number(workoutId), exercises })
			useWorkoutSessionStore.getState().clear()
			setFinished(true)
			toast.success('Workout saved!')
			router.replace('/dashboard')
		} catch (err) {
			console.error('Failed to finish workout:', err)
			toast.error(err instanceof Error ? err.message : 'Failed to save workout.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Button onClick={finishWorkout} disabled={loading || finished || !canSave}>
			{loading ? <Spinner className='ml-1' /> : <Save className='ml-1 h-4 w-4' />}
			Finish workout
		</Button>
	)
}
