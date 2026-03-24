'use client'

import { useMemo } from 'react'
import { X, GripVertical } from 'lucide-react'
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	type DragEndEvent,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { useCreateWorkoutStore } from '@/stores/create-workout.store'
import { exerciseTypeConfig } from '@/lib/exerciseTypeIcons'
import type { ExerciseCardData } from '@/types/view'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'

type SortableExerciseItemProps = {
	exercise: ExerciseCardData
	onRemove: (exerciseId: number) => void
}

function SortableExerciseItem({ exercise, onRemove }: SortableExerciseItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: exercise.id,
	})

	const ExerciseTypeIcon = exercise.type ? exerciseTypeConfig[exercise.type].icon : null

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
			className={`w-full flex items-center gap-2 bg-background ${isDragging ? 'opacity-80 shadow-sm' : ''}`}>
			<button
				type='button'
				className='cursor-grab active:cursor-grabbing p-1 touch-none opacity-30 active:opacity-100 hover:opacity-100 transition-opacity'
				aria-label={`Move ${exercise.name}`}
				{...attributes}
				{...listeners}>
				<GripVertical className='h-6 w-6' />
			</button>
			<Item variant='outline' size='sm' className='w-full flex items-center justify-between'>
				<ItemMedia className='p-2 rounded-full bg-accent'>
					{ExerciseTypeIcon && <ExerciseTypeIcon className='w-4 h-4' />}
				</ItemMedia>
				<ItemContent>
					<p className='text-sm font-medium leading-none flex items-center gap-2'>{exercise.name}</p>
					<p className='text-xs text-muted-foreground mt-1'>{exercise.primaryMuscle?.name ?? 'No muscle group'}</p>
				</ItemContent>
				<ItemActions>
					<Button
						type='button'
						variant='outline'
						className='rounded-full'
						size='icon'
						onClick={() => onRemove(exercise.id)}
						aria-label={`Remove ${exercise.name} from workout`}>
						<X className='h-4 w-4' />
					</Button>
				</ItemActions>
			</Item>
		</div>
	)
}

export function AddWorkoutSelectedExercises() {
	const selectedExercisesMap = useCreateWorkoutStore(state => state.exercises)
	const exerciseOrder = useCreateWorkoutStore(state => state.exerciseOrder)
	const removeExercise = useCreateWorkoutStore(state => state.removeExercise)
	const reorderExercises = useCreateWorkoutStore(state => state.reorderExercises)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	const selectedExercises = useMemo(() => {
		const orderedExercises = exerciseOrder
			.map(exerciseId => selectedExercisesMap[exerciseId])
			.filter((exercise): exercise is ExerciseCardData => Boolean(exercise))

		const missingOrderedExercises = Object.values(selectedExercisesMap).filter(
			exercise => !exerciseOrder.includes(exercise.id),
		)

		return [...orderedExercises, ...missingOrderedExercises]
	}, [exerciseOrder, selectedExercisesMap])

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		if (!over || active.id === over.id) {
			return
		}

		reorderExercises(Number(active.id), Number(over.id))
	}

	if (selectedExercises.length === 0) {
		return <p className='text-sm text-muted-foreground w-full text-center mt-8'>No exercises selected yet.</p>
	}

	return (
		<div className='space-y-3'>
			<p className='text-sm text-muted-foreground'>Selected: {selectedExercises.length}</p>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToVerticalAxis, restrictToParentElement]}
				onDragEnd={handleDragEnd}>
				<SortableContext items={selectedExercises.map(exercise => exercise.id)} strategy={verticalListSortingStrategy}>
					<div className='space-y-2 overflow-hidden'>
						{selectedExercises.map(exercise => (
							<SortableExerciseItem key={exercise.id} exercise={exercise} onRemove={removeExercise} />
						))}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	)
}
