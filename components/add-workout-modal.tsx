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
	const [exList, setExList] = React.useState<number[]>([])
	const [selectedExerciseId, setSelectedExerciseId] = React.useState<number | null>(null)
	const [allExercises, setAllExercises] = React.useState<{ id: number; name: string }[]>([])
	const [loadingExercises, setLoadingExercises] = React.useState(false)
	const [fetchError, setFetchError] = React.useState<string | null>(null)

	React.useEffect(() => {
		if (!open) return
		const fetchExercises = async () => {
			setLoadingExercises(true)
			setFetchError(null)

			const { data, error } = await supabase
				.from('exercises')
				.select('id, exercise_name')
				.order('id', { ascending: true })

			if (error) {
				setFetchError(error.message)
			} else {
				setAllExercises(
					(data ?? []).map(row => ({
						id: row.id,
						name: row.exercise_name ?? '',
					}))
				)
			}

			setLoadingExercises(false)
		}
		fetchExercises()
	}, [open, supabase])

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
				duration: 0,
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

					<div className='mt-6 space-y-3 border-t pt-4'>
						<h3 className='text-sm font-medium'>Exercises in this workout</h3>

						<div className='flex flex-wrap items-end gap-2'>
							<div className='min-w-[200px] flex-1'>
								<FieldLabel htmlFor='exercise-picker'>Add exercise</FieldLabel>
								<Select
									value={selectedExerciseId ? String(selectedExerciseId) : ''}
									onValueChange={v => setSelectedExerciseId(Number(v))}
									disabled={loadingExercises}>
									<SelectTrigger id='exercise-picker'>
										<SelectValue placeholder={loadingExercises ? 'Loading…' : 'Choose exercise'} />
									</SelectTrigger>
									<SelectContent className='max-h-64 overflow-y-auto'>
										<SelectGroup>
											{allExercises.map(ex => (
												<SelectItem key={ex.id} value={String(ex.id)}>
													{ex.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
								{fetchError ? <p className='text-xs text-destructive mt-1'>{fetchError}</p> : null}
							</div>

							<Button
								type='button'
								variant='secondary'
								onClick={() => {
									if (selectedExerciseId == null) return
									setExList(prev => [...prev, selectedExerciseId])
									setSelectedExerciseId(null)
								}}>
								Add
							</Button>
						</div>

						{exList.length === 0 ? (
							<p className='text-xs opacity-60'>No exercises added yet.</p>
						) : (
							<ol className='space-y-1 text-sm'>
								{exList.map((id, i) => {
									const ex = allExercises.find(e => e.id === id)
									return (
										<li key={i} className='flex items-center justify-between rounded border px-2 py-1'>
											<span className='font-medium'>
												{i + 1}. {ex?.name ?? `Exercise ${id}`}
											</span>

											<Button
												type='button'
												size='sm'
												variant='ghost'
												onClick={() => setExList(prev => prev.filter((_, idx) => idx !== i))}>
												Remove
											</Button>
										</li>
									)
								})}
							</ol>
						)}
					</div>

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
