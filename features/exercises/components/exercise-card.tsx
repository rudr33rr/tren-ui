import { Card, CardTitle } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { exerciseTypeConfig } from '@/lib/exerciseTypeIcons'
import type { ExerciseCardData } from '../exercise.types'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'

export const ExerciseCard = ({
	exercise,
	variant = 'default',
	selected = false,
}: {
	exercise: ExerciseCardData
	variant?: 'default' | 'workout'
	selected?: boolean
}) => {
	const ExerciseTypeIcon = exercise.type ? exerciseTypeConfig[exercise.type].icon : null

	return (
		<Item
			variant='outline'
			className={`shadow-none group hover:border-primary transition-colors ${selected ? 'border-primary' : ''}`}>
			{ExerciseTypeIcon && (
				<ItemMedia>
					<div className='p-2 rounded-full bg-accent'>
						<ExerciseTypeIcon className='w-4 h-4' />
					</div>
				</ItemMedia>
			)}

			<ItemContent>
				<CardTitle>{exercise.name}</CardTitle>
				<span className='text-xs opacity-70'>{exercise.primaryMuscle?.name ?? 'None'}</span>
			</ItemContent>
			{variant === 'workout' && (
				<ItemActions>
					<div
						className={`p-2 rounded-full transition-colors ${
							selected ? 'bg-primary text-background' : 'bg-accent group-hover:bg-primary group-hover:text-background'
						}`}>
						{selected ? <Check className='w-3 h-3' /> : <Plus className='w-3 h-3' />}
					</div>
				</ItemActions>
			)}
		</Item>
	)
}
