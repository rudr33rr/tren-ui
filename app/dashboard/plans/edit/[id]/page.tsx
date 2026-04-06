import { notFound } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { workoutPlans } from '@/db/schema'
import { getCurrentUserId } from '@/lib/auth'
import { fetchInitialWorkouts } from '@/data/workouts.server'
import { EditPlanForm } from '@/components/plans/edit-plan-form'
import { Button } from '@/components/ui/button'

const FORM_ID = 'edit-plan-form'

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const planId = Number(id)
	if (Number.isNaN(planId)) {
		notFound()
	}

	const userId = await getCurrentUserId()

	const plan = await db.query.workoutPlans.findFirst({
		where: and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)),
		columns: { id: true, name: true },
		with: {
			days: {
				columns: { dayIndex: true, workoutId: true },
			},
		},
	})

	if (!plan) {
		notFound()
	}

	const workouts = await fetchInitialWorkouts(userId)

	return (
		<div className='w-full space-y-6 p-4 h-full'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-medium'>Edit Plan</h1>
				<Button type='submit' form={FORM_ID}>
					Save changes
				</Button>
			</div>
			<EditPlanForm
				planId={plan.id}
				initialName={plan.name}
				initialDays={plan.days}
				workouts={workouts}
				id={FORM_ID}
			/>
		</div>
	)
}
