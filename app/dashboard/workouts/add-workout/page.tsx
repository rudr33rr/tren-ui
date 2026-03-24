import { AddWorkoutExerciseDrawer } from '@/features/workouts/components/builder/add-workout-exercise-drawer'
import { AddWorkoutNameInput } from '@/features/workouts/components/builder/add-workout-name-input'
import { AddWorkoutSaveButton } from '@/features/workouts/components/builder/add-workout-save-button'
import { AddWorkoutSelectedExercises } from '@/features/workouts/components/builder/add-workout-selected-exercises'
import { createClient } from '@/lib/supabase/server'
import { fetchMuscleGroups } from '@/features/exercises/queries/exercises.server'

export default async function NewWorkoutPage() {
	const supabase = await createClient()
	const { muscles, error: musclesError } = await fetchMuscleGroups(supabase)

	return (
		<div className='w-full space-y-6 p-4 h-full'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-medium'>New Workout</h1>
				<AddWorkoutSaveButton />
			</div>
			<div className='flex flex-col gap-2'>
				<AddWorkoutNameInput />
				<AddWorkoutSelectedExercises />
			</div>
			<div className='flex justify-end'>
				<AddWorkoutExerciseDrawer muscles={muscles} musclesError={musclesError} />
			</div>
		</div>
	)
}
