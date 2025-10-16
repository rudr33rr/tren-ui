import { ExerciseCard } from './exercise-card'
import { createClient } from '@/lib/supabase/server'

type Exercise = {
  id: number
  name: string
  difficulty: 'easy' | 'intermediate' | 'hard'
  primaryMuscle: { id: number; name: string } | null
  secondaryMuscles: string[]
}

export async function ExercisesList() {
  const supabase = await createClient()

  const { data: exercisesData, error } = await supabase
    .from('exercises')
    .select(`
      id,
      exercise_name,
      difficulty,
      primaryMuscle:muscle_groups!exercises_primary_muscle_id_fkey ( id, name ),
      secondary_muscle_ids
    `)
    .order('id', { ascending: true })

  const { data: musclesData } = await supabase
    .from('muscle_groups')
    .select('id, name')

  if (error) {
    return <div className='text-sm text-destructive'>Błąd pobierania ćwiczeń: {error.message}</div>
  }

  if (!exercisesData || exercisesData.length === 0) {
    return <div className='text-sm opacity-70'>Brak ćwiczeń</div>
  }

  const musclesById = new Map<number, string>(
    (musclesData ?? []).map(m => [m.id as number, m.name as string])
  )

  const exercises: Exercise[] = exercisesData.map(item => {
    const primary = Array.isArray(item.primaryMuscle)
      ? item.primaryMuscle[0] ?? null
      : item.primaryMuscle ?? null

    const secondaryNames = Array.isArray(item.secondary_muscle_ids)
      ? (item.secondary_muscle_ids as number[])
          .map(mid => musclesById.get(mid))
          .filter((x): x is string => Boolean(x))
      : []

    return {
      id: item.id as number,
      name: item.exercise_name as string,
      difficulty: item.difficulty as 'easy' | 'intermediate' | 'hard',
      primaryMuscle: primary,
      secondaryMuscles: secondaryNames,
    }
  })

  return (
    <div className='grid gap-4'>
      {exercises.map(ex => (
        <ExerciseCard
          key={ex.id}
          name={ex.name}
          difficulty={ex.difficulty}
          primaryMuscle={ex.primaryMuscle?.name ?? null}
          secondaryMuscles={ex.secondaryMuscles}
        />
      ))}
    </div>
  )
}
