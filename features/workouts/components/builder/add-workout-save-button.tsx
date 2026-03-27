'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { useCreateWorkoutStore } from '@/stores/create-workout.store'
import { createWorkout } from '../../actions/workouts.client'
import type { ExerciseCardData } from '@/types/exercise.types'

export function AddWorkoutSaveButton() {
	const router = useRouter()
	const supabase = createClient()

	const name = useCreateWorkoutStore(state => state.name)
	const exercisesMap = useCreateWorkoutStore(state => state.exercises)
	const exerciseOrder = useCreateWorkoutStore(state => state.exerciseOrder)
	const clear = useCreateWorkoutStore(state => state.clear)

	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const orderedExercises = exerciseOrder
		.map(exerciseId => exercisesMap[exerciseId])
		.filter((exercise): exercise is ExerciseCardData => Boolean(exercise))

	const selectedExercises = [
		...orderedExercises,
		...Object.values(exercisesMap).filter(exercise => !exerciseOrder.includes(exercise.id)),
	]
	const canSave = name.trim().length > 0 && selectedExercises.length > 0 && !loading

	async function saveWorkout() {
		if (!canSave) return

		setLoading(true)
		setErrorMessage(null)

		try {
			await createWorkout(supabase, { name, exercises: selectedExercises })
			clear()
			toast.success('Workout saved!')
			router.push('/dashboard/workouts')
			router.refresh()
		} catch (error) {
			console.error('Failed to save workout:', error)
			const message = error instanceof Error ? error.message : 'Failed to save workout.'
			setErrorMessage(message)
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='flex flex-col items-start gap-1'>
			<Button type='button' variant='secondary' onClick={saveWorkout} disabled={!canSave}>
				{loading ? <Spinner className='mr-1' /> : <Save className='h-4 w-4' />}
				{loading ? 'Saving...' : 'Save workout'}
			</Button>
			{errorMessage && <p className='text-xs text-destructive'>{errorMessage}</p>}
		</div>
	)
}
