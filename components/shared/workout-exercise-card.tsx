'use client'

import { useState, type ComponentProps } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Trash, Plus, ChevronDown, EllipsisVertical, GripVertical } from 'lucide-react'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'
import type { WorkoutExercise } from '@/types/view'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { Checkbox } from '../ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '../ui/dropdown-menu'

type SetData = {
	reps: number
	weight: number
	intensity: number
	completed: boolean
}

type WorkoutExerciseCardProps = {
	exercise: WorkoutExercise
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
	onExerciseCompleted: () => void
	dragHandleProps?: ComponentProps<'button'>
	isDragging?: boolean
}

export default function WorkoutExerciseCard({
	exercise,
	isOpen,
	onOpenChange,
	onExerciseCompleted,
	dragHandleProps,
	isDragging = false,
}: WorkoutExerciseCardProps) {
	const upsertExercise = useWorkoutSessionStore(s => s.upsertExercise)

	const [sets, setSets] = useState<SetData[]>([
		{ reps: 0, weight: 0, intensity: 0, completed: false },
		{ reps: 0, weight: 0, intensity: 0, completed: false },
		{ reps: 0, weight: 0, intensity: 0, completed: false },
	])

	const completedSets = sets.filter(set => set.completed).length

	const isSetReady = (set: SetData) => set.reps > 0 && set.weight > 0 && set.intensity > 0

	const syncExercise = (nextSets: SetData[]) => {
		upsertExercise({
			exerciseId: exercise.id,
			sets: nextSets,
		})
	}

	const updateSet = (index: number, field: keyof SetData, value: number) => {
		const newSets = [...sets]
		newSets[index] = {
			...newSets[index],
			[field]: value,
		}

		if (!isSetReady(newSets[index])) {
			newSets[index].completed = false
		}

		setSets(newSets)
		syncExercise(newSets)
	}

	const toggleSetCompleted = (index: number, checked: boolean) => {
		if (checked && !isSetReady(sets[index])) return

		const wasComplete = sets.every(set => set.completed)
		const newSets = [...sets]
		newSets[index] = {
			...newSets[index],
			completed: checked,
		}

		const isComplete = newSets.every(set => set.completed)

		setSets(newSets)
		syncExercise(newSets)

		if (!wasComplete && isComplete) {
			onExerciseCompleted()
		}
	}

	const addSet = () => {
		const newSets = [...sets, { reps: 0, weight: 0, intensity: 0, completed: false }]
		setSets(newSets)
		syncExercise(newSets)
	}

	const removeSet = (index: number) => {
		if (sets.length === 1) return

		const newSets = sets.filter((_, i) => i !== index)
		setSets(newSets)
		syncExercise(newSets)
	}

	return (
		<div className={`flex ${isDragging ? 'opacity-80 shadow-sm' : ''}`}>
			<button
				type='button'
				className='cursor-grab active:cursor-grabbing p-1 touch-none opacity-30 active:opacity-100 hover:opacity-100 transition-opacity self-start'
				aria-label={`Move ${exercise.name ?? 'exercise'}`}
				{...dragHandleProps}>
				<GripVertical className='h-6 w-6' />
			</button>
			<div className='w-full'>
				<Button
					variant='ghost'
					className='flex items-center gap-2 w-full justify-start'
					onClick={() => onOpenChange(!isOpen)}>
					<div className='w-full flex items-center justify-between'>
						<h3 className='text-lg font-medium'>{exercise.name ?? 'Unnamed Exercise'}</h3>
						<p className='text-xs text-muted-foreground'>
							{completedSets} / {sets.length}
						</p>
					</div>
					<ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
				</Button>
				{isOpen && (
					<div className='flex gap-4 ms-5'>
						<div className='w-px self-stretch bg-accent rounded' />
						<div className='w-full flex flex-col gap-6 items-start pt-2'>
							{sets.map((set, index) => (
								<div key={index} className='flex gap-4 items-start justify-between w-full'>
									<Checkbox
										checked={set.completed}
										onCheckedChange={checked => toggleSetCompleted(index, checked === true)}
										disabled={!isSetReady(set) && !set.completed}
									/>
									<div className='flex flex-col gap-2 w-full'>
										<div className='flex items-center gap-4 w-full'>
											<InputGroup className='max-w-40'>
												<InputGroupInput
													type='number'
													min={0}
													disabled={set.completed}
													value={set.reps || ''}
													onChange={e => updateSet(index, 'reps', Number(e.target.value))}
												/>
												<InputGroupAddon align='inline-end'>reps</InputGroupAddon>
											</InputGroup>
											<InputGroup className='max-w-40'>
												<InputGroupInput
													type='number'
													min={0}
													disabled={set.completed}
													value={set.weight || ''}
													onChange={e => updateSet(index, 'weight', Number(e.target.value))}
												/>
												<InputGroupAddon align='inline-end'>kg</InputGroupAddon>
											</InputGroup>
										</div>
										<div className='grid w-full gap-1'>
											<div className='flex items-center justify-between gap-2'>
												<Label className='text-muted-foreground'>Intensity</Label>
												<span className='text-muted-foreground text-sm'>{set.intensity}</span>
											</div>
											<Slider
												value={[set.intensity]}
												onValueChange={([value]) => updateSet(index, 'intensity', value)}
												disabled={set.completed}
												max={10}
												min={1}
												step={1}
											/>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='icon' aria-label='Workout actions'>
												<EllipsisVertical />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end' className='w-36'>
											<DropdownMenuItem
												disabled={sets.length === 1}
												onSelect={() => removeSet(index)}
												className='text-destructive focus:text-destructive disabled:opacity-30'>
												<Trash className='h-4 w-4' />
												<span>Delete</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							))}
							<Button
								size='sm'
								variant='ghost'
								className='opacity-60 hover:opacity-100 transition-all'
								onClick={addSet}>
								<Plus /> Add set
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
