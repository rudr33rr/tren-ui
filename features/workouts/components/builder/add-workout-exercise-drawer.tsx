'use client'

import { SquarePen } from 'lucide-react'

import { DrawerExercisesInfiniteList } from '@/features/exercises/components/drawer-exercises-infinite-list'
import { ExerciseSearch } from '@/features/exercises/components/exercise-search'
import { Button } from '@/components/ui/button'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import type { MuscleGroup } from '@/types/exercise.types'
import { AddWorkoutExercisesGrid } from './add-workout-exercises-grid'

type Props = {
	muscles: MuscleGroup[]
	musclesError: boolean
}

export function AddWorkoutExerciseDrawer({ muscles, musclesError }: Props) {
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
					<div className='mt-4 min-h-0 flex-1 flex flex-col'>
						<DrawerExercisesInfiniteList>
							{exercises => <AddWorkoutExercisesGrid exercises={exercises} />}
						</DrawerExercisesInfiniteList>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
