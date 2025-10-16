import { Card, CardHeader, CardTitle } from './ui/card'

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <span className='text-sm opacity-70'>{difficulty}</span>
        {primaryMuscle && (
          <span className='text-sm opacity-70'>Primary muscle: {primaryMuscle}</span>
        )}
        {secondaryMuscles && secondaryMuscles.length > 0 && (
          <span className='text-sm opacity-70'>
            Secondary muscles: {secondaryMuscles.join(', ')}
          </span>
        )}
      </CardHeader>
    </Card>
  )
}
