'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useCreateWorkoutStore } from '@/stores/create-workout.store'
import { updateWorkout } from '@/data/workouts.actions'
import type { ExerciseCardData } from '@/types/exercise.types'

export function EditWorkoutSaveButton({ workoutId }: { workoutId: number }) {
	const router = useRouter()

	const name = useCreateWorkoutStore(state => state.name)
	const exercisesMap = useCreateWorkoutStore(state => state.exercises)
	const exerciseOrder = useCreateWorkoutStore(state => state.exerciseOrder)
	const clear = useCreateWorkoutStore(state => state.clear)

	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const orderedExercises = exerciseOrder
		.map(id => exercisesMap[id])
		.filter((ex): ex is ExerciseCardData => Boolean(ex))

	const exercises = [
		...orderedExercises,
		...Object.values(exercisesMap).filter(ex => !exerciseOrder.includes(ex.id)),
	]

	const canSave = name.trim().length > 0 && exercises.length > 0 && !loading

	async function handleSave() {
		if (!canSave) return

		setLoading(true)
		setErrorMessage(null)

		try {
			await updateWorkout({ workoutId, name, exercises })
			clear()
			toast.success('Changes saved!')
			router.push('/dashboard/workouts')
		} catch (error) {
			console.error('Failed to update workout:', error)
			const message = error instanceof Error ? error.message : 'Failed to update workout.'
			setErrorMessage(message)
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='flex flex-col items-start gap-1'>
			<Button type='button' variant='secondary' onClick={handleSave} disabled={!canSave}>
				{loading ? <Spinner className='mr-1' /> : <Save className='h-4 w-4' />}
				{loading ? 'Saving...' : 'Save changes'}
			</Button>
			{errorMessage && <p className='text-xs text-destructive'>{errorMessage}</p>}
		</div>
	)
}
