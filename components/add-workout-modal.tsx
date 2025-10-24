'use client'

import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectGroup, SelectItem } from './ui/select'
import { FieldSet, FieldGroup, Field, FieldLabel } from './ui/field'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { WorkoutCardData } from '@/types/view'

type WorkoutFormData = Omit<WorkoutCardData, 'id' | 'exerciseCount'>

export const AddWorkoutModal = () => {
	const router = useRouter()
	const supabase = createClient()

	const [open, setOpen] = React.useState(false)
	const [submitting, setSubmitting] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [workout, setWorkout] = React.useState<WorkoutFormData>({
		name: '',
		description: null,
		tag: null,
		duration: 0,
	})

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		console.log('[add-workout] submitting')

		if (!workout.name.trim()) {
			setError('Workout name is required')
			return
		}

		setSubmitting(true)
		try {
			const payload = {
				name: workout.name.trim(),
				description: workout.description?.trim?.() || null,
				tag: workout.tag,
				duration: workout.duration ?? null,
			}

			const { error: insertError } = await supabase.from('workouts').insert(payload)
			if (insertError) {
				setError(insertError.message)
				return
			}

			setWorkout({
				name: '',
				description: null,
				tag: null,
				duration: 0,
			})
			setOpen(false)
			router.refresh()
		} catch (err: any) {
			setError(err?.message ?? 'Unexpected error')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type='button'>
					<Plus />
					<span>Add workout</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>Add Workout</DialogTitle>
						<DialogDescription>Describe your workout and add exercises</DialogDescription>
					</DialogHeader>
					<FieldSet>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor='workout-name'>Workout name</FieldLabel>
								<Input
									id='workout-name'
									type='text'
									value={workout.name}
									onChange={e => setWorkout({ ...workout, name: e.target.value })}
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor='workout-description'>Workout description</FieldLabel>
								<Textarea
									id='workout-description'
									value={workout.description ?? ''}
									onChange={e =>
										setWorkout({
											...workout,
											description: e.target.value || null,
										})
									}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor='workout-tag'>Workout tag</FieldLabel>
								<Select
									value={workout.tag ?? ''}
									onValueChange={v =>
										setWorkout({
											...workout,
											tag: v as WorkoutFormData['tag'],
										})
									}>
									<SelectTrigger id='workout-tag'>
										<SelectValue placeholder='Select tag (optional)' />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value='push'>Push</SelectItem>
											<SelectItem value='pull'>Pull</SelectItem>
											<SelectItem value='legs'>Legs</SelectItem>
											<SelectItem value='cardio'>Cardio</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel htmlFor='workout-duration'>Workout duration (min)</FieldLabel>
								<Input
									id='workout-duration'
									inputMode='numeric'
									pattern='[0-9]*'
									value={workout.duration ?? ''}
									onChange={e =>
										setWorkout({
											...workout,
											duration: e.target.value ? Number.parseInt(e.target.value, 10) : 0,
										})
									}
									placeholder='e.g. 60'
								/>
							</Field>
						</FieldGroup>
					</FieldSet>

					<div className='flex items-center justify-between gap-3'>
						{error ? <p className='text-sm text-destructive bg-destructive/10 rounded px-2 py-1'>{error}</p> : <span />}
						<div className='flex gap-2'>
							<Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={submitting}>
								Cancel
							</Button>
							<Button type='submit' disabled={submitting}>
								{submitting ? 'Saving…' : 'Save workout'}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
