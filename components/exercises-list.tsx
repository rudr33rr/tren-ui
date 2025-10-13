import { ExerciseCard } from './exercise-card'
import { createClient } from '@/lib/supabase/server'

export async function ExercisesList() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exercises')
    .select('id, exercise_name, difficulty')
    .order('id', { ascending: true })

  if (error) {
    return <div className="text-sm text-destructive">Błąd pobierania ćwiczeń: {error.message}</div>
  }

  if (!data || data.length === 0) {
    return <div className="text-sm opacity-70">Brak ćwiczeń</div>
  }

  return (
    <div className="grid gap-4">
      {data.map((ex) => (
        <ExerciseCard key={ex.id} name={ex.exercise_name} difficulty={ex.difficulty as any} />
      ))}
    </div>
  )
}
