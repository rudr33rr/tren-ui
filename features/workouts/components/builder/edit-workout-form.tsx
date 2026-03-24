'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateWorkout } from '../../actions/workouts.client'

type EditWorkoutFormProps = {
	workout: {
		id: number
		name: string
		description: string | null
	}
}

export function EditWorkoutForm({ workout }: EditWorkoutFormProps) {
	const supabase = createClient()
	const router = useRouter()

	const [name, setName] = useState(workout.name)
	const [description, setDescription] = useState(workout.description ?? '')
	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const canSave = name.trim().length > 0 && !loading

	async function handleSaveWorkout() {
		if (!canSave) return

		setLoading(true)
		setErrorMessage(null)

		try {
			await updateWorkout(supabase, { workoutId: workout.id, name, description })
			toast.success('Changes saved!')
			router.push('/dashboard/workouts')
			router.refresh()
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
		<div className='space-y-4'>
			<div className='space-y-2'>
				<Label htmlFor='workout-name'>Name</Label>
				<Input id='workout-name' type='text' value={name} onChange={event => setName(event.target.value)} />
			</div>
			<div className='space-y-2'>
				<Label htmlFor='workout-description'>Description</Label>
				<Textarea
					id='workout-description'
					value={description}
					onChange={event => setDescription(event.target.value)}
					placeholder='Optional workout description...'
				/>
			</div>
			<div className='flex flex-col items-start gap-1'>
				<Button type='button' onClick={handleSaveWorkout} disabled={!canSave}>
					{loading ? <Spinner className='mr-1' /> : <Save className='h-4 w-4' />}
					{loading ? 'Saving...' : 'Save changes'}
				</Button>
				{errorMessage ? <p className='text-xs text-destructive'>{errorMessage}</p> : null}
			</div>
		</div>
	)
}
