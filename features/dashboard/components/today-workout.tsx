import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PlanWithDays } from '@/features/plans/queries/plans.server'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type Props = {
	activePlan: PlanWithDays | null
	todayWorkoutSessionId: number | null
}

export function TodayWorkout({ activePlan, todayWorkoutSessionId }: Props) {
	const todayDayIndex = (new Date().getDay() + 6) % 7
	const todayName = DAY_NAMES[todayDayIndex]
	const todayPlanDay = activePlan?.days.find(d => d.dayIndex === todayDayIndex) ?? null

	return (
		<Card className='px-5 py-4 gap-0'>
			<CardHeader className='px-0 pb-3'>
				<CardTitle className='flex items-center gap-2 text-base font-semibold'>
					Today
					<span className='text-muted-foreground font-normal text-sm'>{todayName}</span>
					{todayPlanDay && todayWorkoutSessionId !== null && (
						<Badge variant='secondary' className='flex items-center gap-1 ml-auto'>
							<CheckCircle2 className='w-3 h-3' />
							Done
						</Badge>
					)}
				</CardTitle>
			</CardHeader>

			<CardContent className='px-0 py-0 space-y-3'>
				{!activePlan ? (
					<p className='text-sm text-muted-foreground'>
						No active plan.{' '}
						<Link href='/dashboard/plans' className='underline underline-offset-2'>
							Set up a plan
						</Link>{' '}
						to see your scheduled workouts.
					</p>
				) : !todayPlanDay ? (
					<p className='text-sm text-muted-foreground'>Rest day — no workout scheduled.</p>
				) : (
					<>
						<div>
							<p className='font-medium'>{todayPlanDay.workoutName}</p>
							<p className='text-sm text-muted-foreground'>{todayPlanDay.exerciseCount} exercises</p>
						</div>

						{todayWorkoutSessionId === null ? (
							<Button asChild size='sm'>
								<Link href={`/workout-session/${todayPlanDay.workoutId}`}>Start workout</Link>
							</Button>
						) : (
							<Button asChild size='sm' variant='outline'>
								<Link href={`/workout-session/summary/${todayWorkoutSessionId}`}>View summary</Link>
							</Button>
						)}
					</>
				)}
			</CardContent>
		</Card>
	)
}
