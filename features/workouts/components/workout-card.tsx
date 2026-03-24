import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { StartWorkoutButton } from '@/features/workout-session/components/start-workout-button'
import type { WorkoutCardData } from '../workout.types'
import { WorkoutCardActions } from './workout-card-actions'

export const WorkoutCard = ({ workout }: { workout: WorkoutCardData }) => {
	return (
		<Card className='px-5 py-3 gap-0'>
			<CardHeader className='px-0'>
				<CardTitle className='mt-3'>{workout.name}</CardTitle>
				<CardAction>
					<WorkoutCardActions workoutId={workout.id} />
				</CardAction>
			</CardHeader>
			<CardContent className='px-0 text-sm text-muted-foreground'>
				{typeof workout.exerciseCount === 'number' ? <span>{workout.exerciseCount} exercises</span> : null}
			</CardContent>
			<CardFooter className='px-0 mb-2 mt-6'>
				<StartWorkoutButton workoutId={workout.id} />
			</CardFooter>
		</Card>
	)
}
