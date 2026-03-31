import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import type { PlanWithDays } from '../queries/plans.server'
import { PlanCardActions } from './plan-card-actions'
import { SetActivePlanButton } from './set-active-plan-button'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function PlanCard({ plan }: { plan: PlanWithDays }) {
	return (
		<Card className='px-5 py-3 gap-0'>
			<CardHeader className='px-0'>
				<CardTitle className='mt-3 flex items-center gap-2'>
					{plan.name}
					{plan.isActive && <Badge variant={'secondary'}>Active</Badge>}
				</CardTitle>
				<CardAction>
					<PlanCardActions planId={plan.id} />
				</CardAction>
			</CardHeader>

			<CardContent className='px-0 space-y-4 h-full'>
				<div className='grid grid-cols-7 gap-1 text-center mt-8'>
					{DAY_LABELS.map((label, i) => {
						const day = plan.days.find(d => d.dayIndex === i)
						return (
							<div key={i} className='flex flex-col items-center gap-1'>
								<span className='text-[11px] text-muted-foreground'>{label}</span>
								<div
									className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-colors ${
										day
											? 'bg-primary text-primary-foreground border-primary'
											: 'border-muted-foreground/20 text-muted-foreground/40'
									}`}>
									{day ? '●' : '–'}
								</div>
								{day && (
									<span className='text-[9px] leading-tight text-muted-foreground line-clamp-2 max-w-[40px]'>
										{day.workoutName}
									</span>
								)}
							</div>
						)
					})}
				</div>
			</CardContent>

			<CardFooter className='px-0 mb-2 mt-4 flex items-center gap-2'>
				<SetActivePlanButton planId={plan.id} isActive={plan.isActive} />
			</CardFooter>
		</Card>
	)
}
