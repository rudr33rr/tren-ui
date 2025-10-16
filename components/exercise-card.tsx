import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

export function ExerciseCard({
	name,
	difficulty,
	primaryMuscle,
	secondaryMuscles,
}: {
	name: string
	difficulty: 'easy' | 'intermediate' | 'hard'
	primaryMuscle: string | null
	secondaryMuscles?: string[]
}) {
	const colorMap = {
		easy: 'bg-green-100 text-green-800 border-green-300',
		intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		hard: 'bg-red-100 text-red-800 border-red-300',
	} as const

	return (
		<Card>
			<CardHeader>
				<div className='flex flex-row w-full justify-between items-center'>
					<CardTitle className='mb-0 text-lg'>{name}</CardTitle>
					<Badge className={colorMap[difficulty]}>{difficulty}</Badge>
				</div>
				<span className='text-md opacity-70'>Primary: {primaryMuscle}</span>
			</CardHeader>
			<CardContent>
				{secondaryMuscles && secondaryMuscles.length > 0 && (
					<>
						<span className='text-sm opacity-70'>Secondary muscles:</span>
						<div className='flex gap-2 mt-1 flex-wrap'>
							{secondaryMuscles.map((m, index) => (
								<Badge key={index} variant='outline'>
									{m}
								</Badge>
							))}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	)
}
