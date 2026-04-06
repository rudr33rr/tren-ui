import { Item } from '@/components/ui/item'
import { StartWorkoutButton } from '@/components/workout-session/start-workout-button'
import type { WorkoutCardData } from '@/types/workout.types'
import { WorkoutCardActions } from './workout-card-actions'

export const WorkoutCard = ({ workout }: { workout: WorkoutCardData }) => {
	return (
		<Item variant='outline' className='flex-col items-start gap-3'>
			<div className='flex w-full items-center gap-2'>
				<span className='font-medium'>{workout.name}</span>
				<div className='ml-auto'>
					<WorkoutCardActions workoutId={workout.id} />
				</div>
			</div>

			{typeof workout.exerciseCount === 'number' && (
				<span className='text-sm text-muted-foreground'>{workout.exerciseCount} exercises</span>
			)}

			<StartWorkoutButton workoutId={workout.id} />
		</Item>
	)
}
