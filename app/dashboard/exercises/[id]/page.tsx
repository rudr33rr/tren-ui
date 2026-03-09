import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { getExercisePageData } from '@/lib/db/exercises'

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const exerciseId = Number(id)
	if (Number.isNaN(exerciseId)) {
		notFound()
	}

	const exercise = await getExercisePageData(exerciseId)

	if (!exercise) {
		notFound()
	}

	const colorMap = {
		easy: 'bg-green-100 text-green-800 border-green-300',
		intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		hard: 'bg-red-100 text-red-800 border-red-300',
	} as const

	return (
		<div className='w-full space-y-6 p-4'>
			<div className='space-y-3'>
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<h1 className='text-2xl font-medium'>{exercise.name}</h1>
						<p className='text-sm opacity-70'>
							{exercise.sessions.length} completed session{exercise.sessions.length === 1 ? '' : 's'}
						</p>
					</div>
					<Badge className={colorMap[exercise.difficulty]}>{exercise.difficulty}</Badge>
				</div>

				<Card className='mb-6 mt-4'>
					<CardHeader>
						<CardTitle>Instructions</CardTitle>
					</CardHeader>
					<CardContent>
						{exercise.instructions.length > 0 ? (
							<ol className='list-decimal pl-5 space-y-2'>
								{exercise.instructions.map((instruction, index) => (
									<li key={index} className='text-sm leading-tight'>
										{instruction}
									</li>
								))}
							</ol>
						) : (
							<div className='text-sm opacity-50 italic'>No instructions set</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Details</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='mb-3'>
							<div className='text-sm opacity-70 mb-1'>Primary muscle:</div>
							{exercise.primaryMuscle ? (
								<Badge variant='outline'>{exercise.primaryMuscle.name}</Badge>
							) : (
								<div className='text-sm opacity-50 italic'>No primary muscle set</div>
							)}
						</div>

						<div>
							<div className='text-sm opacity-70 mb-1'>Secondary muscles:</div>
							{exercise.secondaryMuscles.length > 0 ? (
								<div className='flex flex-wrap gap-2'>
									{exercise.secondaryMuscles.map(m => (
										<Badge key={m.id} variant='outline'>
											{m.name}
										</Badge>
									))}
								</div>
							) : (
								<div className='text-sm opacity-50 italic'>No secondary muscles set</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Completed sessions</CardTitle>
					</CardHeader>
					<CardContent>
						{exercise.sessions.length > 0 ? (
							<div className='space-y-4'>
								{exercise.sessions.map(session => (
									<div key={session.sessionId} className='rounded-lg border p-4'>
										<div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
											<div>
												<p className='font-medium'>{session.workoutName}</p>
												<p className='text-sm opacity-70'>
													{session.finishedAt?.toLocaleDateString() ?? 'Finished recently'}
													{typeof session.duration === 'number' ? ` • ${session.duration} min` : ''}
												</p>
											</div>
											<div className='flex flex-wrap gap-2 text-xs opacity-80'>
												<Badge variant='outline'>{session.sets.length} sets</Badge>
												<Badge variant='outline'>{session.totalRepetitions} reps</Badge>
												{typeof session.maxWeight === 'number' ? (
													<Badge variant='outline'>{session.maxWeight} kg max</Badge>
												) : null}
											</div>
										</div>

										<div className='mt-3 space-y-2'>
											{session.sets.map(set => (
												<div
													key={`${session.sessionId}-${set.setNumber}`}
													className='flex flex-wrap gap-x-3 gap-y-1 text-sm opacity-80'>
													<span>Set {set.setNumber}</span>
													<span>{set.repetitions} reps</span>
													{typeof set.weight === 'number' ? <span>{set.weight} kg</span> : null}
													{typeof set.intensity === 'number' ? <span>RPE {set.intensity}</span> : null}
												</div>
											))}
										</div>

										{session.notes ? <p className='mt-3 text-sm opacity-70'>{session.notes}</p> : null}
									</div>
								))}
							</div>
						) : (
							<div className='text-sm opacity-50 italic'>No completed sessions for this exercise yet</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
