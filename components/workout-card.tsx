import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

export type WorkoutCardProps = {
	name: string
	description: string | null
	tag: string | null
	duration: number | null
	exerciseCount: number
}

export const WorkoutCard = ({ name, description, tag, duration, exerciseCount }: WorkoutCardProps) => {
	const colorMap = {
		push: 'bg-green-100 text-green-800 border-green-300',
		pull: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		legs: 'bg-red-100 text-red-800 border-red-300',
	} as const

	const tagKey = (tag ?? '').toLowerCase() as keyof typeof colorMap
	const badgeClass = tag && colorMap[tagKey] ? colorMap[tagKey] : ''

	return (
		<Card>
			<CardHeader>
				<div className='flex flex-row w-full justify-between items-center'>
					<CardTitle>{name}</CardTitle>
					{tag ? <Badge className={`border ${badgeClass}`}>{tag}</Badge> : null}
				</div>
				{description ? <span className='text-sm opacity-80'>{description}</span> : null}
			</CardHeader>
			<CardContent>
				<div className='text-sm opacity-70 flex gap-3'>
					{typeof duration === 'number' ? <span>Duration: {duration} min</span> : null}
					{typeof exerciseCount === 'number' ? <span>{exerciseCount} exercises</span> : null}
				</div>
			</CardContent>
		</Card>
	)
}
