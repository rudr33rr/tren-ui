'use client'

import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Trash, Plus, ChevronDown, EllipsisVertical, Check, CircleCheckBig } from 'lucide-react'
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

const DEFAULT_SET = { reps: 0, weight: 0, intensity: 0, completed: false }
const DEFAULT_SET_COUNT = 3

const INTENSITY_LEVELS = Array.from({ length: 10 }, (_, index) => index + 1)

const createDefaultSets = () => Array.from({ length: DEFAULT_SET_COUNT }, () => ({ ...DEFAULT_SET }))

const normalizeSet = (set?: Partial<SetData>): SetData => ({
	reps: set?.reps ?? 0,
	weight: set?.weight ?? 0,
	intensity: set?.intensity ?? 0,
	completed: Boolean(set?.completed),
})

type WorkoutExerciseCardProps = {
	exercise: WorkoutExercise
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
}

export default function WorkoutExerciseCard({ exercise, isOpen, onOpenChange }: WorkoutExerciseCardProps) {
	const upsertExercise = useWorkoutSessionStore(s => s.upsertExercise)
	const storedSets = useWorkoutSessionStore(s => s.exercises[exercise.id]?.sets)

	const [sets, setSets] = useState<SetData[]>(() => {
		if (storedSets && storedSets.length > 0) {
			return storedSets.map(set => normalizeSet(set))
		}

		return createDefaultSets()
	})

	useEffect(() => {
		if (!storedSets || storedSets.length === 0) {
			return
		}

		setSets(storedSets.map(set => normalizeSet(set)))
	}, [storedSets])

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
		newSets[index].completed = isSetReady(newSets[index])

		setSets(newSets)
		syncExercise(newSets)
	}

	const toggleSetCompleted = (index: number, checked: boolean) => {
		if (checked && !isSetReady(sets[index])) return

		const newSets = [...sets]
		newSets[index] = {
			...newSets[index],
			completed: checked,
		}

		setSets(newSets)
		syncExercise(newSets)
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
		<div className='w-full'>
			<Button
				variant='ghost'
				className={`h-14 flex items-center gap-2 w-full justify-start px-2 md:px-4 ${
					isExerciseCompleted
						? 'bg-green-100/70 text-green-900 hover:bg-green-100 border border-green-300/70 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800'
						: ''
				}`}
				onClick={() => onOpenChange(!isOpen)}>
				<ChevronDown
					className={`h-4 w-4 transition-transform ${isExerciseCompleted ? 'text-green-800 dark:text-green-300' : ''} ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
				<div className='w-full flex items-center justify-between'>
					<span className='flex gap-2 items-center'>
						{isExerciseCompleted && <CircleCheckBig className='text-green-700 dark:text-green-300' />}
						<h3 className='font-medium text-lg'>{exercise.name ?? 'Unnamed Exercise'}</h3>
					</span>
					<p
						className={`text-xs ${isExerciseCompleted ? 'text-green-800 dark:text-green-300' : 'text-muted-foreground'}`}>
						{completedSets} / {sets.length}
					</p>
				</div>
			</Button>
			<div
				className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${
					isOpen ? 'grid-rows-[1fr] opacity-100 md:mt-4 mt-2' : 'grid-rows-[0fr] opacity-0'
				}`}>
				<div className='overflow-hidden'>
					<div className={`flex gap-3 md:gap-4 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
						<div className='w-px self-stretch bg-accent rounded ms-3 hidden md:block' />
						<div className='w-full flex flex-col gap-4 md:gap-6 items-start pt-2'>
							{sets.map((set, index) => (
								<div
									key={index}
									className='grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border border-border/50 p-3 md:flex md:items-start md:justify-between md:gap-4 md:border-0 md:p-0'>
									<Button
										type='button'
										className={`row-start-1 col-start-1 group rounded-full size-8 p-1 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-100 ${
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
									<p className='row-start-1 col-start-2 text-xs text-muted-foreground self-center md:hidden'>
										Set {index + 1}
									</p>
									<div className='row-start-2 col-span-3 w-full flex flex-col gap-2 md:row-auto md:col-auto md:flex-1'>
										<div className='grid grid-cols-1 gap-2 w-full sm:grid-cols-2 md:flex md:items-center md:gap-4'>
											<InputGroup className='w-full md:max-w-40'>
												<InputGroupInput
													type='number'
													min={0}
													disabled={set.completed}
													value={set.reps || ''}
													onChange={e => updateSet(index, 'reps', Number(e.target.value))}
												/>
												<InputGroupAddon align='inline-end'>reps</InputGroupAddon>
											</InputGroup>
											<InputGroup className='w-full md:max-w-40'>
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
												variant='outline'
												className='grid w-full grid-cols-5 gap-1 sm:flex sm:flex-wrap'
												spacing={1}
												disabled={set.completed}
												value={set.intensity > 0 ? String(set.intensity) : ''}
												onValueChange={value => updateSet(index, 'intensity', value ? Number(value) : 0)}>
												{INTENSITY_LEVELS.map(level => (
													<ToggleGroupItem
														key={level}
														value={String(level)}
														className='w-full px-0 sm:w-auto sm:px-2 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background hover:data-[state=on]:bg-foreground/90'>
														{level}
													</ToggleGroupItem>
												))}
											</ToggleGroup>
										</div>
									</div>
									<div className='row-start-1 col-start-3 justify-self-end md:row-auto md:col-auto'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant='ghost' size='icon-sm' aria-label='Workout actions'>
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
								</div>
							))}
							<Button
								size='sm'
								variant='ghost'
								className='w-full md:w-auto justify-center opacity-70 hover:opacity-100 transition-all'
								onClick={addSet}>
								<Plus /> Add set
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
