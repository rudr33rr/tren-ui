import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Car } from 'lucide-react'

type ExercisePageProps = {
	params: {
		id: string
	}
}

export default async function ExercisePage({ params }: ExercisePageProps) {
	const supabase = await createClient()

	const exerciseId = Number(params.id)
	if (Number.isNaN(exerciseId)) {
		notFound()
	}

	const { data: exercise, error } = await supabase
		.from('exercises')
		.select(
			`
        id,
        exercise_name,
        difficulty,
        primaryMuscle:muscle_groups!exercises_primary_muscle_id_fkey ( id, name ),
        secondary_muscle_ids,
		instructions
      `
		)
		.eq('id', exerciseId)
		.single()

	if (error || !exercise) {
		notFound()
	}

	const { data: musclesData } = await supabase.from('muscle_groups').select('id, name')

	const musclesById = new Map<number, { id: number; name: string }>(
		(musclesData ?? []).map(m => [m.id, { id: m.id, name: m.name }])
	)

	const primary = Array.isArray(exercise.primaryMuscle)
		? exercise.primaryMuscle[0] ?? null
		: exercise.primaryMuscle ?? null

	const secondaryMuscles = Array.isArray(exercise.secondary_muscle_ids)
		? exercise.secondary_muscle_ids
				.map((mid: number) => musclesById.get(mid))
				.filter((x): x is { id: number; name: string } => Boolean(x))
		: []

	const instructions = Array.isArray(exercise.instructions) ? exercise.instructions : []

	return (
		<div>
			<Card>
				<CardHeader>
					<div className='flex flex-row w-full justify-between items-start gap-2'>
						<div>
							<CardTitle className='mb-1 text-xl'>{exercise.exercise_name}</CardTitle>
							<div className='text-sm opacity-70'>Primary: {primary ? primary.name : '—'}</div>
						</div>

						<Badge
							className={
								exercise.difficulty === 'easy'
									? 'bg-green-100 text-green-800 border-green-300'
									: exercise.difficulty === 'intermediate'
									? 'bg-yellow-100 text-yellow-800 border-yellow-300'
									: 'bg-red-100 text-red-800 border-red-300'
							}>
							{exercise.difficulty}
						</Badge>
					</div>
				</CardHeader>

				<CardContent>
					{secondaryMuscles.length > 0 ? (
						<div>
							<div className='text-sm opacity-70 mb-1'>Secondary muscles:</div>
							<div className='flex flex-wrap gap-2'>
								{secondaryMuscles.map(m => (
									<Badge key={m.id} variant='outline'>
										{m.name}
									</Badge>
								))}
							</div>
						</div>
					) : (
						<div className='text-sm opacity-50 italic'>No secondary muscles set</div>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardContent>
					<ol>
						{instructions.length > 0 ? (
							instructions.map((ins: string, i: number) => (
								<li key={i}>{ins}</li>
							))
						) : (
							<div className='text-sm opacity-50 italic'>No instructions set</div>
						)}
					</ol>
				</CardContent>
			</Card>
		</div>
	)
}
