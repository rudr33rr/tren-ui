import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExerciseStats, type SessionPoint } from '@/features/exercises/components/exercise-stats'

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const exerciseId = Number(id)
	if (Number.isNaN(exerciseId)) {
		notFound()
	}

	const supabase = await createClient()

	const [{ data: exercise }, { data: authData }] = await Promise.all([
		supabase
			.from('exercises')
			.select('id, exercise_name, tracking_type, weight_type')
			.eq('id', exerciseId)
			.single(),
		supabase.auth.getUser(),
	])

	if (!exercise) {
		notFound()
	}

	let history: SessionPoint[] = []

	if (authData.user) {
		const { data: sessions } = await supabase
			.from('exercise_session')
			.select(
				`
				workout_session (created_at),
				exercise_set (reps, duration_sec, weight, intensity)
			`,
			)
			.eq('exercise_id', exerciseId)
			.eq('user_id', authData.user.id)
			.limit(60)

		history = (sessions ?? [])
			.filter(s => s.workout_session?.created_at != null)
			.sort(
				(a, b) =>
					new Date(a.workout_session!.created_at!).getTime() -
					new Date(b.workout_session!.created_at!).getTime(),
			)
			.map(session => {
				const sets = session.exercise_set

				const validWeights = sets.map(s => s.weight).filter((w): w is number => w != null)
				const validReps = sets.map(s => s.reps).filter((r): r is number => r != null)
				const validDurations = sets
					.map(s => s.duration_sec)
					.filter((d): d is number => d != null)
				const validIntensities = sets
					.map(s => s.intensity)
					.filter((i): i is number => i != null && i > 0)

				return {
					date: new Date(session.workout_session!.created_at!).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
					}),
					maxWeight: validWeights.length > 0 ? Math.max(...validWeights) : undefined,
					totalVolume: sets.some(s => s.weight != null && s.reps != null)
						? sets.reduce(
								(acc, s) => acc + (s.weight != null && s.reps != null ? s.weight * s.reps : 0),
								0,
							)
						: undefined,
					maxReps: validReps.length > 0 ? Math.max(...validReps) : undefined,
					maxDuration: validDurations.length > 0 ? Math.max(...validDurations) : undefined,
					avgIntensity:
						validIntensities.length > 0
							? Math.round(
									validIntensities.reduce((a, b) => a + b, 0) / validIntensities.length,
								)
							: undefined,
				}
			})
	}

	return (
		<div className='w-full space-y-6 p-4'>
			<h1 className='text-2xl font-medium'>{exercise.exercise_name}</h1>
			<ExerciseStats
				trackingType={exercise.tracking_type}
				weightType={exercise.weight_type}
				history={history}
			/>
		</div>
	)
}
