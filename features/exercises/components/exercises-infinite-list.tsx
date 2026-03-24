'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { fetchExercisesPage } from '../queries/exercises.client'
import { ExerciseCard } from './exercise-card'
import type { ExerciseCardData } from '../exercise.types'

const PAGE_SIZE = 20

type Props = {
	initialExercises: ExerciseCardData[]
	initialHasMore: boolean
	search?: string
	muscle?: string
	type?: string
}

export function ExercisesInfiniteList({ initialExercises, initialHasMore, search, muscle, type }: Props) {
	const supabaseRef = useRef(createClient())

	const fetchPage = useCallback(
		(page: number) => fetchExercisesPage(supabaseRef.current, page, { search, muscle, type }),
		[search, muscle, type],
	)

	const { items: exercises, loading, sentinelRef } = useInfiniteScroll({
		fetchPage,
		initialItems: initialExercises,
		initialHasMore,
		pageSize: PAGE_SIZE,
	})

	if (exercises.length === 0) {
		return <div className='text-sm opacity-70'>No exercises available</div>
	}

	return (
		<>
			<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-2'>
				{exercises.map(ex => (
					<Link key={ex.id} href={`/dashboard/exercises/${ex.id}`} className='block'>
						<ExerciseCard exercise={ex} />
					</Link>
				))}
			</div>
			<div ref={sentinelRef} className='flex justify-center py-6'>
				{loading && <Spinner className='size-5' />}
			</div>
		</>
	)
}
