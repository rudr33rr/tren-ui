import { AddWorkoutExerciseDrawer } from '@/components/workout/builder/add-workout-exercise-drawer'
import { AddWorkoutNameInput } from '@/components/workout/builder/add-workout-name-input'
import { AddWorkoutSaveButton } from '@/components/workout/builder/add-workout-save-button'
import { AddWorkoutSelectedExercises } from '@/components/workout/builder/add-workout-selected-exercises'
import { createClient } from '@/lib/supabase/server'

export default async function NewWorkoutPage() {
	const supabase = await createClient()

	const { data: musclesData, error: musclesFetchError } = await supabase
		.from('muscle_groups')
		.select('id, name')
		.order('name')

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
				<AddWorkoutExerciseDrawer
					muscles={musclesData ?? []}
					musclesError={Boolean(musclesFetchError)}
				/>
			</div>
		</div>
	)
}
