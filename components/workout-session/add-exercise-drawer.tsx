'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddSessionExercisesGrid } from '@/components/workout-session/add-session-exercises-grid'
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

export default function AddExerciseDrawer({ muscles, musclesError, exercises, exercisesErrorMessage }: Props) {
	const [open, setOpen] = useState(false)

	return (
		<Drawer open={open} onOpenChange={setOpen} direction='bottom'>
			<div className='flex justify-end mt-6'>
				<DrawerTrigger asChild>
					<Button variant='outline'>
						<Plus className='h-4 w-4' />
						Add exercise
					</Button>
				</DrawerTrigger>
			</div>
			<DrawerContent className='h-[80vh]'>
				<DrawerHeader className='sr-only'>
					<DrawerTitle>Add exercise to session</DrawerTitle>
					<DrawerDescription>Search and select exercises to include in this session.</DrawerDescription>
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
								<AddSessionExercisesGrid exercises={exercises} onSelect={() => setOpen(false)} />
							</ScrollArea>
						)}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
