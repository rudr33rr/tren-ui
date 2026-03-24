'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EllipsisVertical, SquarePen, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { deleteWorkout } from '../actions/workouts.client'

export function WorkoutCardActions({ workoutId }: { workoutId: number }) {
	const supabase = createClient()
	const router = useRouter()
	const [deleting, setDeleting] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	async function handleDeleteWorkout() {
		if (deleting) return

		const confirmed = window.confirm('Delete this workout and all related sessions?')
		if (!confirmed) return

		setDeleting(true)
		setErrorMessage(null)

		try {
			await deleteWorkout(supabase, workoutId)
			toast.success('Workout deleted')
			router.refresh()
		} catch (error) {
			console.error('Failed to delete workout:', error)
			const message = error instanceof Error ? error.message : 'Failed to delete workout.'
			setErrorMessage(message)
			toast.error(message)
		} finally {
			setDeleting(false)
		}
	}

	return (
		<div className='flex flex-col items-end gap-1'>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' size='icon' aria-label='Workout actions' disabled={deleting}>
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-36'>
					<DropdownMenuItem asChild disabled={deleting}>
						<Link href={`/dashboard/workouts/edit/${workoutId}`} className='flex items-center gap-2'>
							<SquarePen className='h-4 w-4' />
							<span>Edit</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={deleting}
						onSelect={() => {
							void handleDeleteWorkout()
						}}
						className='text-destructive focus:text-destructive'>
						<Trash className='h-4 w-4' />
						<span>{deleting ? 'Deleting...' : 'Delete'}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			{errorMessage ? <p className='text-xs text-destructive'>{errorMessage}</p> : null}
		</div>
	)
}
