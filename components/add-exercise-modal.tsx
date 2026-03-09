'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { createExerciseAction } from '@/app/dashboard/exercises/actions'
import type { DifficultyLevel, MuscleOption } from '@/types/view'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from './ui/field'
import { Input } from './ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'

type ExerciseFormData = {
	name: string
	difficulty: DifficultyLevel
	primaryMuscleId: number | null
	secondaryMuscleIds: number[]
	instructions: string
}

const initialFormState: ExerciseFormData = {
	name: '',
	difficulty: 'easy',
	primaryMuscleId: null,
	secondaryMuscleIds: [],
	instructions: '',
}

export function AddExerciseModal({ muscles }: { muscles: MuscleOption[] }) {
	const [open, setOpen] = React.useState(false)
	const [submitting, setSubmitting] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [exercise, setExercise] = React.useState<ExerciseFormData>(initialFormState)

	function resetForm() {
		setExercise(initialFormState)
		setError(null)
	}

	function toggleSecondaryMuscle(muscleId: number, checked: boolean) {
		setExercise(current => ({
			...current,
			secondaryMuscleIds: checked
				? Array.from(new Set([...current.secondaryMuscleIds, muscleId]))
				: current.secondaryMuscleIds.filter(id => id !== muscleId),
		}))
	}

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null)
		setSubmitting(true)

		try {
			const result = await createExerciseAction({
				name: exercise.name,
				difficulty: exercise.difficulty,
				primaryMuscleId: exercise.primaryMuscleId,
				secondaryMuscleIds: exercise.secondaryMuscleIds,
				instructions: exercise.instructions.split('\n'),
			})

			if (!result.ok) {
				setError(result.error ?? 'Unexpected error')
				return
			}

			resetForm()
			setOpen(false)
		} catch {
			setError('Unexpected error')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen)
				if (!nextOpen && !submitting) {
					resetForm()
				}
			}}>
			<DialogTrigger asChild>
				<Button type='button' variant='secondary'>
					<Plus />
					<span>Add exercise</span>
				</Button>
			</DialogTrigger>
			<DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>Add Exercise</DialogTitle>
						<DialogDescription>Create a new exercise for your training library</DialogDescription>
					</DialogHeader>

					<FieldSet className='mt-4'>
						<FieldGroup className='gap-4'>
							<div className='flex flex-col gap-4 sm:flex-row'>
								<Field className='gap-1'>
									<FieldLabel className='text-xs' htmlFor='exercise-name'>
										Exercise name
									</FieldLabel>
									<Input
										id='exercise-name'
										value={exercise.name}
										onChange={event => setExercise(current => ({ ...current, name: event.target.value }))}
										required
									/>
								</Field>

								<Field className='gap-1 sm:max-w-52'>
									<FieldLabel className='text-xs' htmlFor='exercise-difficulty'>
										Difficulty
									</FieldLabel>
									<Select
										value={exercise.difficulty}
										onValueChange={value =>
											setExercise(current => ({
												...current,
												difficulty: value as DifficultyLevel,
											}))
										}>
										<SelectTrigger id='exercise-difficulty'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value='easy'>Easy</SelectItem>
												<SelectItem value='intermediate'>Intermediate</SelectItem>
												<SelectItem value='hard'>Hard</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
							</div>

							<Field className='gap-1'>
								<FieldLabel className='text-xs' htmlFor='exercise-primary-muscle'>
									Primary muscle
								</FieldLabel>
								<Select
									value={exercise.primaryMuscleId === null ? '__none__' : String(exercise.primaryMuscleId)}
									onValueChange={value => {
										const primaryMuscleId = value === '__none__' ? null : Number(value)

										setExercise(current => ({
											...current,
											primaryMuscleId,
											secondaryMuscleIds: current.secondaryMuscleIds.filter(id => id !== primaryMuscleId),
										}))
									}}>
									<SelectTrigger id='exercise-primary-muscle'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value='__none__'>No primary muscle</SelectItem>
											{muscles.map(muscle => (
												<SelectItem key={muscle.id} value={String(muscle.id)}>
													{muscle.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</Field>

							<Field className='gap-2'>
								<div>
									<FieldLabel className='text-xs'>Secondary muscles</FieldLabel>
									<FieldDescription>Select every supporting muscle group that applies</FieldDescription>
								</div>
								<div className='grid gap-2 sm:grid-cols-2'>
									{muscles.map(muscle => {
										const checked = exercise.secondaryMuscleIds.includes(muscle.id)
										const disabled = muscle.id === exercise.primaryMuscleId

										return (
											<label key={muscle.id} className='flex items-center gap-3 rounded-md border px-3 py-2 text-sm'>
												<Checkbox
													checked={checked}
													disabled={disabled || submitting}
													onCheckedChange={value => toggleSecondaryMuscle(muscle.id, value === true)}
												/>
												<span className={disabled ? 'opacity-50' : ''}>{muscle.name}</span>
											</label>
										)
									})}
								</div>
							</Field>

							<Field className='gap-1'>
								<FieldLabel className='text-xs' htmlFor='exercise-instructions'>
									Instructions
								</FieldLabel>
								<FieldDescription>Write one instruction step per line</FieldDescription>
								<Textarea
									id='exercise-instructions'
									value={exercise.instructions}
									onChange={event => setExercise(current => ({ ...current, instructions: event.target.value }))}
									rows={6}
									placeholder={'Stand tall\nBrace your core\nLower slowly'}
								/>
							</Field>
						</FieldGroup>
					</FieldSet>

					<div className='mt-4 flex items-center justify-between gap-3'>
						{error ? <p className='rounded bg-destructive/10 px-2 py-1 text-sm text-destructive'>{error}</p> : <span />}
						<div className='flex gap-2'>
							<Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={submitting}>
								Cancel
							</Button>
							<Button type='submit' disabled={submitting}>
								{submitting ? 'Saving…' : 'Save exercise'}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
