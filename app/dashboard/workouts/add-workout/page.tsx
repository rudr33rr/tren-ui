import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { ExerciseCard } from '@/components/exercise-card'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { ExerciseCardData } from '@/types/view'

export default async function NewWorkoutPage() {
	const supabase = await createClient()

	const { data: exercisesData, error: exercisesError } = await supabase
		.from('exercises')
		.select(
			`
      id,
      exercise_name,
      difficulty,
      primaryMuscle:muscle_groups!exercises_primary_muscle_id_fkey ( id, name ),
      secondary_muscle_ids,
	  type
    `,
		)
		.order('id', { ascending: true })

	const { data: musclesData } = await supabase.from('muscle_groups').select('id, name')

	const musclesById = new Map<number, { id: number; name: string }>(
		(musclesData ?? []).map(m => [m.id, { id: m.id, name: m.name }]),
	)

	const exercises: ExerciseCardData[] = (exercisesData ?? []).map(item => {
		const primary = Array.isArray(item.primaryMuscle) ? (item.primaryMuscle[0] ?? null) : (item.primaryMuscle ?? null)

		const secondaryMusclesObjects = Array.isArray(item.secondary_muscle_ids)
			? item.secondary_muscle_ids
					.map(mid => musclesById.get(mid))
					.filter((x): x is { id: number; name: string } => Boolean(x))
			: []

		return {
			id: item.id,
			name: item.exercise_name,
			difficulty: item.difficulty,
			primaryMuscle: primary ? { id: primary.id, name: primary.name } : null,
			secondaryMuscles: secondaryMusclesObjects,
			type: item.type,
		}
	})

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-medium'>Add Workout</h1>
				<Button asChild type='button' variant='ghost'>
					<Link href='/dashboard/workouts'>
						<ArrowLeft />
						Back to workouts
					</Link>
				</Button>
			</div>
			<div className='w-full flex gap-8 justify-between'>
				<div className='space-y-2 w-full'>
					{exercisesError ? (
						<div className='text-sm text-destructive'>Error: {exercisesError.message}</div>
					) : exercises.length === 0 ? (
						<div className='text-sm opacity-70'>No exercises available</div>
					) : (
						<div className='grid sm:grid-cols-1 xl:grid-cols-2 gap-4'>
							{exercises.map(ex => (
								<ExerciseCard key={ex.id} exercise={ex} />
							))}
						</div>
					)}
				</div>
				<Card className='w-120'>
					<CardHeader>
						<CardTitle>Workout Name</CardTitle>
					</CardHeader>
				</Card>
			</div>
		</div>
	)
}
