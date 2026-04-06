import { Badge } from '@/components/ui/badge'
import { Item } from '@/components/ui/item'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { PlanWithDays } from '@/data/plans.server'
import { PlanCardActions } from './plan-card-actions'
import { SetActivePlanButton } from './set-active-plan-button'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function PlanCard({ plan }: { plan: PlanWithDays }) {
	return (
		<Item variant='outline' className='flex-col items-start gap-3'>
			<div className='flex w-full items-center gap-2'>
				<span className='font-medium'>{plan.name}</span>
				{plan.isActive && <Badge variant='secondary'>Active</Badge>}
				<div className='ml-auto'>
					<PlanCardActions planId={plan.id} />
				</div>
			</div>

			<div className='flex w-full gap-1'>
				{DAY_LABELS.map((label, i) => {
					const day = plan.days.find(d => d.dayIndex === i)
					if (day) {
						return (
							<Tooltip key={i}>
								<TooltipTrigger asChild>
									<div className='flex h-7 flex-1 cursor-default items-center justify-center rounded bg-primary text-[11px] font-medium text-primary-foreground transition-colors'>
										{label[0]}
									</div>
								</TooltipTrigger>
								<TooltipContent>{day.workoutName}</TooltipContent>
							</Tooltip>
						)
					}
					return (
						<div key={i} className='flex h-7 flex-1 items-center justify-center rounded bg-muted text-[11px] font-medium text-muted-foreground/40'>
							{label[0]}
						</div>
					)
				})}
			</div>

			<SetActivePlanButton planId={plan.id} isActive={plan.isActive} />
		</Item>
	)
}
