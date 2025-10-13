import { Card, CardHeader, CardTitle } from './ui/card'

export type Exercise = {
  id: number
  exercise_name: string
  difficulty: 'easy' | 'intermediate' | 'hard'
}

export function ExerciseCard({ name, difficulty }: { name: string; difficulty: Exercise['difficulty'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {name}
        </CardTitle>
        <span className="text-sm opacity-70">{difficulty}</span>
      </CardHeader>
    </Card>
  )
}
