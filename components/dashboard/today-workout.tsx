import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Item } from '@/components/ui/item'
import type { PlanWithDays } from '@/data/plans.server'

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
		<Item variant='outline' className='flex-col items-start gap-3'>
			<div className='flex w-full items-center gap-2'>
				<span className='text-base font-semibold'>Today</span>
				<span className='text-muted-foreground text-sm'>{todayName}</span>
				{todayPlanDay && todayWorkoutSessionId !== null && (
					<Badge variant='secondary' className='flex items-center gap-1 ml-auto'>
						<CheckCircle2 className='w-3 h-3' />
						Done
					</Badge>
				)}
			</div>

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
		</Item>
	)
}
