'use client'

import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Plus, Trash } from 'lucide-react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectGroup, SelectItem } from './ui/select'
import { FieldSet, FieldGroup, Field, FieldLabel } from './ui/field'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { WorkoutCardData } from '@/types/view'
import { ExerciseCombobox } from '@/components/shared/exercises-combobox'

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
		duration: 10,
	})
	const [exList, setExList] = React.useState<number[]>([])
	const [selectedExerciseId, setSelectedExerciseId] = React.useState<number | null>(null)

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

			const { data: workoutRows, error: insertWorkoutError } = await supabase
				.from('workouts')
				.insert(payload)
				.select('id')
				.single()

			if (insertWorkoutError) {
				setError(insertWorkoutError.message)
				return
			}

			const newWorkoutId = workoutRows.id

			if (exList.length > 0) {
				const relRows = exList.map(exerciseId => ({
					workout_id: newWorkoutId,
					exercise_id: exerciseId,
				}))

				const { error: relError } = await supabase.from('workout_exercises').insert(relRows)

				if (relError) {
					setError(relError.message)
					return
				}
			}

			setWorkout({
				name: '',
				description: null,
				tag: null,
				duration: 10,
			})
			setExList([])
			setSelectedExerciseId(null)

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
					<FieldSet className='mt-4'>
						<FieldGroup className='gap-4'>
							<div className='flex gap-2'>
								<Field className='gap-1'>
									<FieldLabel className='text-xs' htmlFor='workout-name'>
										Workout name
									</FieldLabel>
									<Input
										id='workout-name'
										type='text'
										value={workout.name}
										onChange={e => setWorkout({ ...workout, name: e.target.value })}
										required
									/>
								</Field>
								<Field className='gap-1'>
									<FieldLabel className='text-xs' htmlFor='workout-tag'>
										Workout tag
									</FieldLabel>
									<Select
										value={workout.tag ?? ''}
										onValueChange={v =>
											setWorkout({
												...workout,
												tag: v as WorkoutFormData['tag'],
											})
										}>
										<SelectTrigger id='workout-tag'>
											<SelectValue />
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
							</div>
							<Field className='gap-1'>
								<FieldLabel className='text-xs' htmlFor='workout-description'>
									Workout description
								</FieldLabel>
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

							<Field className='gap-1'>
								<FieldLabel className='text-xs' htmlFor='exercise-picker'>
									Add exercise
								</FieldLabel>
								<div className='flex gap-2'>
									<ExerciseCombobox
										value={selectedExerciseId}
										onChange={id => setSelectedExerciseId(id)}
										disabled={submitting}
										placeholder='Choose exercise'
									/>
									<Button
										type='button'
										variant='secondary'
										onClick={() => {
											if (selectedExerciseId == null) return
											setExList(prev => [...prev, selectedExerciseId])
											setSelectedExerciseId(null)
										}}>
										Add <Plus />
									</Button>
								</div>
							</Field>
						</FieldGroup>
					</FieldSet>

					<div className='mt-6 space-y-3 border-t pt-4'>
						<h3 className='text-sm font-medium'>Exercises in this workout</h3>

						{exList.length === 0 ? (
							<p className='text-xs opacity-60'>No exercises added yet.</p>
						) : (
							<ol className='space-y-0.5 text-sm'>
								{exList.map((id, i) => {
									return (
										<li key={i} className='flex items-center justify-between'>
											<span className='font-medium'>
												<span className='text-muted-foreground'>{i + 1}.</span> {`Exercise ${id}`}
											</span>

											<Button
												type='button'
												size='sm'
												className='text-destructive hover:text-destructive'
												variant='ghost'
												onClick={() => setExList(prev => prev.filter((_, idx) => idx !== i))}>
												<Trash />
											</Button>
										</li>
									)
								})}
							</ol>
						)}
					</div>

					<div className='flex items-center justify-between gap-3 mt-4'>
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
