import { createClient } from '@/lib/supabase/server'
import { WorkoutCard } from './workout-card'

type Workout = {
	id: number
	name: string
	description: string | null
	tag: string | null
	duration: number | null
	exerciseCount: number
}

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

	const workouts: Workout[] = workoutsData.map(w => ({
		id: w.id as number,
		name: w.name as string,
		description: (w.description as string) ?? null,
		tag: (w.tag as string) ?? null,
		duration: (w.duration as number) ?? null,
		exerciseCount: Array.isArray((w as any).workout_exercises)
			? (w as any).workout_exercises.length
			: 0,
	}))

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
