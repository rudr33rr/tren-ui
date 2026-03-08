import { listExercises } from '@/lib/db/exercises'
import { ExerciseCard } from '@/components/exercise-card'

export const ExercisesList = async ({ search, muscle }: { search?: string; muscle?: string }) => {
	const exercises = await listExercises({ search, muscle })

	if (exercises.length === 0) {
		return <div className='text-sm opacity-70'>No exercises found</div>
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
			{exercises.map(exercise => (
				<ExerciseCard
					key={exercise.id}
					id={exercise.id}
					name={exercise.name}
					difficulty={exercise.difficulty}
					primaryMuscle={exercise.primaryMuscle?.name ?? null}
					secondaryMuscles={exercise.secondaryMuscles}
				/>
			))}
		</div>
	)
}
