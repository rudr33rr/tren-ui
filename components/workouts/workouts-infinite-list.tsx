'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { fetchWorkoutsPage } from '@/data/workouts.client'
import { WorkoutCard } from './workout-card'
import type { WorkoutCardData } from '@/types/workout.types'

const PAGE_SIZE = 20

type Props = {
	initialWorkouts: WorkoutCardData[]
	initialHasMore: boolean
}

export function WorkoutsInfiniteList({ initialWorkouts, initialHasMore }: Props) {
	const fetchPage = useCallback((page: number) => fetchWorkoutsPage(page), [])

	const {
		items: workouts,
		loading,
		sentinelRef,
	} = useInfiniteScroll({
		fetchPage,
		initialItems: initialWorkouts,
		initialHasMore,
		pageSize: PAGE_SIZE,
	})

	if (workouts.length === 0) {
		return (
			<div className='flex flex-col items-center gap-3 py-16 text-center'>
				<Dumbbell className='size-8 text-muted-foreground/50' />
				<div className='space-y-1'>
					<p className='font-medium'>No workouts yet</p>
					<p className='text-sm text-muted-foreground'>Create your first workout to get started.</p>
				</div>
				<Button asChild variant='secondary' size='sm'>
					<Link href='/dashboard/workouts/add-workout'>Create first workout</Link>
				</Button>
			</div>
		)
	}

	return (
		<>
			<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-4'>
				{workouts.map(w => (
					<WorkoutCard key={w.id} workout={w} />
				))}
			</div>
			<div ref={sentinelRef} className='flex justify-center py-6'>
				{loading && <Spinner className='size-5' />}
			</div>
		</>
	)
}

export function WorkoutsListSkeleton() {
	return (
		<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-4'>
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className='rounded-xl border px-5 py-3 space-y-3'>
					<Skeleton className='h-6 w-2/3 mt-3' />
					<Skeleton className='h-4 w-1/4' />
					<Skeleton className='h-9 w-full mt-6' />
				</div>
			))}
		</div>
	)
}
