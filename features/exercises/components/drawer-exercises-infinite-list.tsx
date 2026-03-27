'use client'

import { useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { fetchExercisesPage } from '../queries/exercises.client'
import type { ExerciseCardData } from '../../../types/exercise.types'

const PAGE_SIZE = 20

type Props = {
	children: (exercises: ExerciseCardData[]) => React.ReactNode
}

export function DrawerExercisesInfiniteList({ children }: Props) {
	const params = useSearchParams()
	const search = params.get('search') ?? undefined
	const muscle = params.get('muscle') ?? undefined
	const type = params.get('type') ?? undefined

	const supabaseRef = useRef(createClient())
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	const fetchPage = useCallback(
		(page: number) => fetchExercisesPage(supabaseRef.current, page, { search, muscle, type }),
		[search, muscle, type],
	)

	const {
		items: exercises,
		loading,
		error,
		sentinelRef,
	} = useInfiniteScroll({
		fetchPage,
		pageSize: PAGE_SIZE,
		scrollRoot: scrollContainerRef,
	})

	return (
		<div ref={scrollContainerRef} className='overflow-y-auto flex-1 min-h-0'>
			{error ? (
				<p className='text-sm text-destructive'>Error: {error}</p>
			) : exercises.length === 0 && !loading ? (
				<p className='text-sm opacity-70'>No exercises available</p>
			) : exercises.length === 0 && loading ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2'>
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className='rounded-xl border p-4 space-y-2'>
							<Skeleton className='h-5 w-3/4' />
							<Skeleton className='h-4 w-1/2' />
						</div>
					))}
				</div>
			) : (
				children(exercises)
			)}
			<div ref={sentinelRef} className='flex justify-center py-4'>
				{loading && exercises.length > 0 && <Spinner className='size-5' />}
			</div>
		</div>
	)
}
