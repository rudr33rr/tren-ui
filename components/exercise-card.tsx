import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

type ExerciseCardProps = {
	id: number
	name: string | null
	difficulty: 'easy' | 'intermediate' | 'hard'
	primaryMuscle: string | null
	secondaryMuscles?: { id: number; name: string }[]
}

export const ExerciseCard = ({ id, name, difficulty, primaryMuscle, secondaryMuscles }: ExerciseCardProps) => {
	const colorMap = {
		easy: 'bg-green-100 text-green-800 border-green-300',
		intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		hard: 'bg-red-100 text-red-800 border-red-300',
	} as const

	return (
		<Link href={`/dashboard/exercises/${id}`} className='block h-full'>
			<Card className='h-full transition-colors hover:border-foreground/30'>
				<CardHeader>
					<div className='flex flex-row w-full items-center justify-between gap-3'>
						<CardTitle className='mb-0 text-lg'>{name}</CardTitle>
						<Badge className={colorMap[difficulty]}>{difficulty}</Badge>
					</div>
					<span className='text-md opacity-70'>Primary: {primaryMuscle ?? 'Not set'}</span>
				</CardHeader>
				<CardContent>
					{secondaryMuscles && secondaryMuscles.length > 0 ? (
						<>
							<span className='text-sm opacity-70'>Secondary muscles:</span>
							<div className='mt-1 flex flex-wrap gap-2'>
								{secondaryMuscles.map(m => (
									<Badge key={m.id} variant='outline'>
										{m.name}
									</Badge>
								))}
							</div>
						</>
					) : (
						<span className='text-sm opacity-60'>Open exercise details</span>
					)}
				</CardContent>
			</Card>
		</Link>
	)
}
