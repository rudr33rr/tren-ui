import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { StartWorkoutButton } from './shared/start-workout-button'
import type { WorkoutCardData } from '@/types/view'

export const WorkoutCard = ({ workout }: { workout: WorkoutCardData }) => {
	const colorMap = {
		push: 'bg-green-100 text-green-800 border-green-300',
		pull: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		legs: 'bg-red-100 text-red-800 border-red-300',
	} as const

	const tagKey = (workout.tag ?? '').toLowerCase() as keyof typeof colorMap
	const badgeClass = workout.tag && colorMap[tagKey] ? colorMap[tagKey] : ''

	return (
		<Card>
			<CardHeader>
				<div className='flex flex-row w-full justify-between items-center'>
					<CardTitle>{workout.name}</CardTitle>
					{workout.tag ? <Badge className={`border ${badgeClass}`}>{workout.tag}</Badge> : null}
				</div>
				{workout.description ? <span className='text-sm opacity-80'>{workout.description}</span> : null}
			</CardHeader>
			<CardContent>
				<div className='text-sm opacity-70 flex gap-3'>
					{typeof workout.duration === 'number' ? <span>Duration: {workout.duration} min</span> : null}
					{typeof workout.exerciseCount === 'number' ? <span>{workout.exerciseCount} exercises</span> : null}
				</div>
			</CardContent>
			<CardFooter>
				<StartWorkoutButton workoutId={workout.id} />
			</CardFooter>
		</Card>
	)
}
