import { ExerciseCard } from './exercise-card'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { ExerciseCardData } from '@/types/view'

export const ExercisesList = async ({ search, muscle }: { search?: string; muscle?: string }) => {
	const supabase = await createClient()

	let query = supabase.from('exercises').select(
		`
      id,
      exercise_name,
      difficulty,
      primaryMuscle:muscle_groups!exercises_primary_muscle_id_fkey ( id, name ),
      secondary_muscle_ids
    `,
	)

	if (search) {
		query = query.ilike('exercise_name', `%${search}%`)
	}

	if (muscle) {
		query = query.eq('primary_muscle_id', Number(muscle))
	}

	const { data: exercisesData, error } = await query.order('id', {
		ascending: true,
	})

	const { data: musclesData } = await supabase.from('muscle_groups').select('id, name')

	if (error) {
		return <div className='text-sm text-destructive'>Błąd pobierania ćwiczeń: {error.message}</div>
	}

	if (!exercisesData || exercisesData.length === 0) {
		return <div className='text-sm opacity-70'>Brak ćwiczeń</div>
	}

	const musclesById = new Map<number, { id: number; name: string }>(
		(musclesData ?? []).map(m => [m.id, { id: m.id, name: m.name }]),
	)

	const exercises: ExerciseCardData[] = exercisesData.map(item => {
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
		}
	})

	return (
		<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-4'>
			{exercises.map(ex => (
				<Link key={ex.id} href={`/dashboard/excercises/${ex.id}`} className='block'>
					<ExerciseCard
						key={ex.id}
						name={ex.name}
						difficulty={ex.difficulty}
						primaryMuscle={ex.primaryMuscle?.name ?? null}
						secondaryMuscles={ex.secondaryMuscles}
					/>
				</Link>
			))}
		</div>
	)
}
