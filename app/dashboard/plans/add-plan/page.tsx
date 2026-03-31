import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchInitialWorkouts } from '@/features/workouts/queries/workouts.server'
import { AddPlanForm } from '@/features/plans/components/add-plan-form'
import { Button } from '@/components/ui/button'

const FORM_ID = 'add-plan-form'

export default async function AddPlanPage() {
	const supabase = await createClient()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	if (error || !user) redirect('/auth/login')

	const workouts = await fetchInitialWorkouts(supabase, user.id)

	return (
		<div className='w-full space-y-6 p-4 h-full'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-medium'>New Plan</h1>
				<Button type='submit' form={FORM_ID}>
					Save plan
				</Button>
			</div>
			<AddPlanForm workouts={workouts} id={FORM_ID} />
		</div>
	)
}
