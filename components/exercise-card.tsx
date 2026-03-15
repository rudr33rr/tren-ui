import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import type { ExerciseCardData } from '@/types/view'

export const ExerciseCard = ({ exercise }: { exercise: ExerciseCardData }) => {
	const colorMap = {
		easy: 'bg-green-100 text-green-800 border-green-300',
		intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		hard: 'bg-red-100 text-red-800 border-red-300',
	} as const

	return (
		<Card>
			<CardHeader>
				<div className='flex flex-row w-full justify-between items-center'>
					<CardTitle className='mb-0 text-lg'>{exercise.name}</CardTitle>
					<Badge className={colorMap[exercise.difficulty]}>{exercise.difficulty}</Badge>
				</div>
				<span className='text-md opacity-70'>Primary: {exercise.primaryMuscle?.name ?? 'None'}</span>
			</CardHeader>
			<CardContent>
				{exercise.secondaryMuscles.length > 0 && (
					<>
						<span className='text-sm opacity-70'>Secondary muscles:</span>
						<div className='flex gap-2 mt-1 flex-wrap'>
							{exercise.secondaryMuscles.map(m => (
								<Badge key={m.id} variant='outline'>
									{m.name}
								</Badge>
							))}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	)
}
