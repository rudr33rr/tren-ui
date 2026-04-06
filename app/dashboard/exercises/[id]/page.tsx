import { notFound } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { exercises, exerciseSession } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'
import { ExerciseStats, type SessionPoint } from '@/components/exercises/exercise-stats'

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const exerciseId = Number(id)
	if (Number.isNaN(exerciseId)) {
		notFound()
	}

	const userId = await getCurrentUserId()

	const exercise = await db.query.exercises.findFirst({
		where: eq(exercises.id, exerciseId),
		columns: { id: true, exerciseName: true, trackingType: true, weightType: true },
	})

	if (!exercise) {
		notFound()
	}

	const sessions = await db.query.exerciseSession.findMany({
		where: and(eq(exerciseSession.exerciseId, exerciseId), eq(exerciseSession.userId, userId)),
		with: {
			session: { columns: { createdAt: true } },
			sets: { columns: { reps: true, durationSec: true, weight: true, intensity: true } },
		},
		limit: 60,
	})

	const history: SessionPoint[] = sessions
		.filter(s => s.session?.createdAt != null)
		.sort((a, b) => new Date(a.session!.createdAt!).getTime() - new Date(b.session!.createdAt!).getTime())
		.map(s => {
			const sets = s.sets

			const validWeights = sets
				.map(x => (x.weight != null ? Number(x.weight) : null))
				.filter((w): w is number => w != null)
			const validReps = sets.map(x => x.reps).filter((r): r is number => r != null)
			const validDurations = sets.map(x => x.durationSec).filter((d): d is number => d != null)
			const validIntensities = sets.map(x => x.intensity).filter((i): i is number => i != null && i > 0)

			return {
				date: new Date(s.session!.createdAt!).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
				}),
				maxWeight: validWeights.length > 0 ? Math.max(...validWeights) : undefined,
				totalVolume: sets.some(x => x.weight != null && x.reps != null)
					? sets.reduce((acc, x) => acc + (x.weight != null && x.reps != null ? Number(x.weight) * x.reps : 0), 0)
					: undefined,
				maxReps: validReps.length > 0 ? Math.max(...validReps) : undefined,
				maxDuration: validDurations.length > 0 ? Math.max(...validDurations) : undefined,
				avgIntensity:
					validIntensities.length > 0
						? Math.round(validIntensities.reduce((a, b) => a + b, 0) / validIntensities.length)
						: undefined,
			}
		})

	return (
		<div className='w-full space-y-6 p-4'>
<h1 className='text-2xl font-medium'>{exercise.exerciseName}</h1>
			<ExerciseStats trackingType={exercise.trackingType} weightType={exercise.weightType} history={history} />
		</div>
	)
}
