'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				throw userError ?? new Error('User not authenticated.')
			}

			const { error } = await supabase
				.from('workouts')
				.update({
					name: name.trim(),
					description: description.trim().length > 0 ? description.trim() : null,
				})
				.eq('id', workout.id)
				.eq('user_id', user.id)

			if (error) {
				throw error
			}

			router.push('/dashboard/workouts')
			router.refresh()
		} catch (error) {
			console.error('Failed to update workout:', error)
			setErrorMessage(error instanceof Error ? error.message : 'Failed to update workout.')
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
					<Save className='h-4 w-4' />
					{loading ? 'Saving...' : 'Save changes'}
				</Button>
				{errorMessage ? <p className='text-xs text-destructive'>{errorMessage}</p> : null}
			</div>
		</div>
	)
}
