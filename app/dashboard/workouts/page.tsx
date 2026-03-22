import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkoutsList } from '@/components/workout/workouts-list'

export default async function WorkoutsPage() {
	return (
		<div className='w-full space-y-6 p-4'>
			<div className='flex w-full justify-between'>
				<h1 className='text-2xl font-medium'>Workouts</h1>
				<Button asChild type='button' variant='secondary'>
					<Link href='/dashboard/workouts/add-workout'>
						<Plus />
						<span>Add workout</span>
					</Link>
				</Button>
			</div>
			<WorkoutsList />
		</div>
	)
}
