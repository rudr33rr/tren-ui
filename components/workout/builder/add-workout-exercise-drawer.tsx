'use client'

import { SquarePen } from 'lucide-react'

import { AddWorkoutExercisesGrid } from '@/components/workout/builder/add-workout-exercises-grid'
import { ExerciseSearch } from '@/components/exercise/exercise-search'
import { Button } from '@/components/ui/button'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ExerciseCardData, MuscleGroup } from '@/types/view'

type Props = {
	muscles: MuscleGroup[]
	musclesError: boolean
	exercises: ExerciseCardData[]
	exercisesErrorMessage?: string
}

export function AddWorkoutExerciseDrawer({ muscles, musclesError, exercises, exercisesErrorMessage }: Props) {
	return (
		<Drawer direction='bottom'>
			<DrawerTrigger asChild>
				<Button type='button' variant='default'>
					<SquarePen className='h-4 w-4' />
					Exercises
				</Button>
			</DrawerTrigger>
			<DrawerContent className='h-[80vh]'>
				<DrawerHeader className='sr-only'>
					<DrawerTitle>Add exercises to workout</DrawerTitle>
					<DrawerDescription>Search and select exercises to include in this workout.</DrawerDescription>
				</DrawerHeader>
				<div className='w-full max-w-7xl mx-auto h-full p-4 flex flex-col'>
					<ExerciseSearch muscles={muscles} musclesError={musclesError} />
					<div className='mt-4 min-h-0 flex-1'>
						{exercisesErrorMessage ? (
							<div className='text-sm text-destructive'>Error: {exercisesErrorMessage}</div>
						) : exercises.length === 0 ? (
							<div className='text-sm opacity-70'>No exercises available</div>
						) : (
							<ScrollArea className='h-full overflow-visible' scrollbarClassName='w-3.5 p-1 translate-x-full'>
								<AddWorkoutExercisesGrid exercises={exercises} />
							</ScrollArea>
						)}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
