'use client'

import { useState, type ComponentProps } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import {
	Trash,
	Plus,
	ChevronDown,
	EllipsisVertical,
	GripVertical,
	Check,
	CircleCheckBig,
} from 'lucide-react'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'
import type { WorkoutExercise } from '@/types/view'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '../ui/dropdown-menu'

type SetData = {
	reps: number
	weight: number
	intensity: number
	completed: boolean
}

const INTENSITY_LEVELS = Array.from({ length: 10 }, (_, index) => index + 1)

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
	const isExerciseCompleted = sets.length > 0 && completedSets === sets.length

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
				className='cursor-grab active:cursor-grabbing touch-none opacity-30 active:opacity-100 hover:opacity-100 transition-opacity self-start'
				aria-label={`Move ${exercise.name ?? 'exercise'}`}
				{...dragHandleProps}>
				<GripVertical className='md:h-6 md:w-6 h-4 w-4' />
			</button>
			<div className='w-full'>
				<Button
					variant='ghost'
					className={`flex items-center gap-2 w-full justify-start ${
						isExerciseCompleted
							? 'bg-green-100/70 text-green-900 hover:bg-green-100 border border-green-300/70 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800'
							: ''
					}`}
					onClick={() => onOpenChange(!isOpen)}>
					<div className='w-full flex items-center justify-between'>
						<span className='flex gap-2 items-center'>
							{isExerciseCompleted && <CircleCheckBig className='text-muted-foreground' />}
							<h3 className='text-lg font-medium'>{exercise.name ?? 'Unnamed Exercise'}</h3>
						</span>
						<p
							className={`text-xs ${isExerciseCompleted ? 'text-green-800 dark:text-green-300' : 'text-muted-foreground'}`}>
							{completedSets} / {sets.length}
						</p>
					</div>
					<ChevronDown
						className={`h-4 w-4 transition-transform ${isExerciseCompleted ? 'text-green-800 dark:text-green-300' : ''} ${
							isOpen ? 'rotate-180' : ''
						}`}
					/>
				</Button>
				<div
					className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${
						isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'
					}`}>
					<div className='overflow-hidden'>
						<div className={`flex gap-4 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
							<div className='w-px self-stretch bg-accent rounded ms-3 hidden md:block' />
							<div className='w-full flex flex-col gap-6 items-start pt-2'>
								{sets.map((set, index) => (
									<div key={index} className='flex gap-4 items-start justify-between w-full'>
										<Button
											type='button'
											className={`group rounded-full size-8 p-0 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-100 ${
												set.completed
													? 'bg-green-600 text-white hover:bg-green-500'
													: 'border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
											} ${
												!isSetReady(set) && !set.completed
													? 'cursor-not-allowed border-dashed bg-muted text-muted-foreground/45 hover:bg-muted hover:text-muted-foreground/45'
													: ''
											}`}
											aria-label={set.completed ? 'Unmark set as done' : 'Mark set as done'}
											onClick={() => toggleSetCompleted(index, !set.completed)}
											disabled={!isSetReady(set) && !set.completed}>
											<Check
												className={`transition-opacity ${
													set.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
												}`}
											/>
										</Button>
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
												<Label className='text-muted-foreground text-xs'>Intensity</Label>
												<ToggleGroup
													type='single'
													size='sm'
													spacing={2}
													disabled={set.completed}
													value={set.intensity > 0 ? String(set.intensity) : ''}
													onValueChange={value => updateSet(index, 'intensity', value ? Number(value) : 0)}>
													{INTENSITY_LEVELS.map(level => (
														<ToggleGroupItem key={level} value={String(level)}>
															{level}
														</ToggleGroupItem>
													))}
												</ToggleGroup>
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
					</div>
				</div>
			</div>
		</div>
	)
}
