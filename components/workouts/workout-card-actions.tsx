'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EllipsisVertical, SquarePen, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { deleteWorkout } from '@/data/workouts.actions'

export function WorkoutCardActions({ workoutId }: { workoutId: number }) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [deleting, setDeleting] = useState(false)

	async function handleDeleteWorkout() {
		if (deleting) return
		setDeleting(true)
		try {
			await deleteWorkout(workoutId)
			toast.success('Workout deleted')
			router.refresh()
		} catch (error) {
			console.error('Failed to delete workout:', error)
			const message = error instanceof Error ? error.message : 'Failed to delete workout.'
			toast.error(message)
		} finally {
			setDeleting(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
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
						onSelect={e => {
							e.preventDefault()
							setOpen(true)
						}}
						className='text-destructive focus:text-destructive'>
						<Trash className='h-4 w-4' />
						<span>Delete</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialogContent size='sm'>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete workout?</AlertDialogTitle>
					<AlertDialogDescription>This will also delete all related sessions. This action cannot be undone.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant='destructive' onClick={() => void handleDeleteWorkout()}>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
