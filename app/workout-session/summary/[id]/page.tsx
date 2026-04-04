import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { workoutSession } from '@/db/schema'
import { Button } from '@/components/ui/button'

export default async function WorkoutSummaryPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const sessionId = Number(id)

	if (Number.isNaN(sessionId)) {
		notFound()
	}

	const session = await db.query.workoutSession.findFirst({
		where: eq(workoutSession.id, sessionId),
		with: {
			workout: { columns: { name: true } },
			exerciseSessions: {
				with: {
					exercise: {
						columns: { exerciseName: true, trackingType: true, weightType: true },
					},
					sets: {
						columns: { reps: true, durationSec: true, weight: true, intensity: true },
					},
				},
			},
		},
	})

	if (!session) {
		notFound()
	}

	const totalVolume = session.exerciseSessions.reduce((acc, es) => {
		return (
			acc +
			es.sets.reduce((setAcc, s) => {
				if (s.weight != null && s.reps != null) return setAcc + Number(s.weight) * s.reps
				return setAcc
			}, 0)
		)
	}, 0)

	const allIntensities = session.exerciseSessions
		.flatMap(es => es.sets)
		.map(s => s.intensity)
		.filter((i): i is number => i != null && i > 0)

	const avgIntensity =
		allIntensities.length > 0 ? Math.round(allIntensities.reduce((a, b) => a + b, 0) / allIntensities.length) : null

	function intensityColor(rpe: number): { border: string; text: string } {
		if (rpe <= 4) return { border: 'border-green-500', text: 'text-green-500' }
		if (rpe <= 6) return { border: 'border-yellow-500', text: 'text-yellow-500' }
		if (rpe <= 8) return { border: 'border-orange-500', text: 'text-orange-500' }
		return { border: 'border-red-500', text: 'text-red-500' }
	}

	const formattedDate = session.createdAt
		? new Date(session.createdAt).toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		: null

	return (
		<div className='min-h-screen flex flex-col items-center justify-start p-4 pt-12 max-w-2xl mx-auto w-full'>
			<div className='flex flex-col items-center gap-2 mb-8'>
				<CheckCircle2 className='h-12 w-12 text-green-500' />
				<h1 className='text-2xl font-semibold'>Workout complete!</h1>
				<p className='text-muted-foreground text-sm'>{formattedDate}</p>
			</div>

			<div className='flex justify-center gap-8 mb-8'>
				{totalVolume > 0 && (
					<div className='flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-primary gap-1'>
						<p className='font-bold text-xl leading-none'>{totalVolume.toLocaleString()}</p>
						<p className='text-xs text-muted-foreground'>kg volume</p>
					</div>
				)}
				<div className='flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-primary gap-1'>
					<p className='font-bold text-xl leading-none'>{session.exerciseSessions.length}</p>
					<p className='text-xs text-muted-foreground'>exercises</p>
				</div>
			</div>

			{avgIntensity != null && (
				<div className='flex justify-center mb-8'>
					<div
						className={`flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 gap-1 ${intensityColor(avgIntensity).border}`}>
						<p className={`font-bold text-2xl leading-none ${intensityColor(avgIntensity).text}`}>{avgIntensity}</p>
						<p className='text-xs text-muted-foreground'>avg intensity</p>
					</div>
				</div>
			)}

			<div className='flex flex-col gap-2 w-full'>
				<Button asChild>
					<Link href='/dashboard'>
						Go to dashboard
						<ChevronRight className='h-4 w-4' />
					</Link>
				</Button>
			</div>
		</div>
	)
}
