import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { StartWorkoutButton } from './shared/start-workout-button'
import type { WorkoutCardData } from '@/types/view'

export function WorkoutCard({ id, name, description, tag, exerciseCount }: WorkoutCardData) {
	const colorMap = {
		push: 'bg-green-100 text-green-800 border-green-300',
		pull: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		legs: 'bg-red-100 text-red-800 border-red-300',
		cardio: 'bg-sky-100 text-sky-800 border-sky-300',
	} as const

	const badgeClass = tag ? colorMap[tag] : ''

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
					{typeof exerciseCount === 'number' ? <span>{exerciseCount} exercises</span> : null}
				</div>
			</CardContent>
			<CardFooter>
				<StartWorkoutButton workoutId={id} />
			</CardFooter>
		</Card>
	)
}
