'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { isExerciseType } from '@/lib/exerciseTypeIcons'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import type { ExerciseCardData } from '@/types/view'

const PAGE_SIZE = 20

type Props = {
	children: (exercises: ExerciseCardData[]) => React.ReactNode
}

export function DrawerExercisesInfiniteList({ children }: Props) {
	const params = useSearchParams()
	const search = params.get('search') ?? undefined
	const muscle = params.get('muscle') ?? undefined
	const type = params.get('type') ?? undefined

	const [exercises, setExercises] = useState<ExerciseCardData[]>([])
	const [hasMore, setHasMore] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const pageRef = useRef(0)
	const sentinelRef = useRef<HTMLDivElement>(null)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const supabaseRef = useRef(createClient())

	const fetchExercises = useCallback(
		async (page: number): Promise<ExerciseCardData[]> => {
			const from = page * PAGE_SIZE
			const to = from + PAGE_SIZE - 1

			let query = supabaseRef.current.from('exercises').select(`
				id,
				exercise_name,
				primaryMuscle:muscle_groups!exercises_primary_muscle_id_fkey ( id, name ),
				type
			`)

			if (search) query = query.ilike('exercise_name', `%${search}%`)
			if (muscle) query = query.eq('primary_muscle_id', Number(muscle))
			if (type && isExerciseType(type)) query = query.eq('type', type)

			const { data, error } = await query.order('id', { ascending: true }).range(from, to)

			if (error) throw error

			return (data ?? []).map(item => {
				const primary = Array.isArray(item.primaryMuscle)
					? (item.primaryMuscle[0] ?? null)
					: (item.primaryMuscle ?? null)

				return {
					id: item.id,
					name: item.exercise_name,
					primaryMuscle: primary ? { id: primary.id, name: primary.name } : null,
					secondaryMuscles: [],
					type: item.type,
				}
			})
		},
		[search, muscle, type],
	)

	// Reset and load first page whenever filters change
	useEffect(() => {
		let cancelled = false
		setLoading(true)
		setError(null)
		setExercises([])
		setHasMore(false)
		pageRef.current = 0

		fetchExercises(0)
			.then(data => {
				if (cancelled) return
				setExercises(data)
				setHasMore(data.length === PAGE_SIZE)
				pageRef.current = 1
			})
			.catch(err => {
				if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load exercises.')
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [fetchExercises])

	const fetchMore = useCallback(async () => {
		if (loading || !hasMore) return
		setLoading(true)

		try {
			const data = await fetchExercises(pageRef.current)
			setExercises(prev => [...prev, ...data])
			setHasMore(data.length === PAGE_SIZE)
			pageRef.current += 1
		} catch (err) {
			console.error('Failed to load more exercises:', err)
		} finally {
			setLoading(false)
		}
	}, [loading, hasMore, fetchExercises])

	const fetchMoreRef = useRef(fetchMore)
	fetchMoreRef.current = fetchMore

	useEffect(() => {
		const sentinel = sentinelRef.current
		const container = scrollContainerRef.current
		if (!sentinel || !container) return

		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) void fetchMoreRef.current()
			},
			{ root: container, rootMargin: '100px' },
		)

		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [])

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
