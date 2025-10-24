import { createClient } from '@/lib/supabase/server'
import { WorkoutCard } from './workout-card'
import type { WorkoutCardData } from '@/types/view'

export const WorkoutsList = async () => {
	const supabase = await createClient()

	const { data: workoutsData, error } = await supabase
		.from('workouts')
		.select('id, name, description, tag, duration, workout_exercises(id)')
		.order('id', { ascending: true })

	if (error) {
		return <div className='text-sm text-destructive'>Błąd pobierania treningów: {error.message}</div>
	}

	if (!workoutsData || workoutsData.length === 0) {
		return <div className='text-sm opacity-70'>Brak treningów</div>
	}

	const workouts: WorkoutCardData[] = workoutsData.map(w => {
		const exercisesRel = Array.isArray((w as any).workout_exercises)
			? (w as any).workout_exercises
			: []

		return {
			id: w.id,
			name: w.name,
			description: w.description,
			tag: w.tag,
			duration: w.duration,
			exerciseCount: exercisesRel.length,
		}
	})

	return (
		<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-4'>
			{workouts.map(w => (
				<WorkoutCard
					key={w.id}
					name={w.name}
					description={w.description}
					tag={w.tag}
					duration={w.duration}
					exerciseCount={w.exerciseCount}
				/>
			))}
		</div>
	)
}
