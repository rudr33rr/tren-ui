'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EllipsisVertical, SquarePen, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { deletePlan } from '@/data/plans.actions'

export function PlanCardActions({ planId }: { planId: number }) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [deleting, setDeleting] = useState(false)

	async function handleDelete() {
		if (deleting) return
		setDeleting(true)
		try {
			await deletePlan(planId)
			toast.success('Plan deleted')
			router.refresh()
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to delete plan.'
			toast.error(message)
		} finally {
			setDeleting(false)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' size='icon' aria-label='Plan actions' disabled={deleting}>
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-36'>
					<DropdownMenuItem asChild disabled={deleting}>
						<Link href={`/dashboard/plans/edit/${planId}`} className='flex items-center gap-2'>
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
					<AlertDialogTitle>Delete plan?</AlertDialogTitle>
					<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant='destructive' onClick={() => void handleDelete()}>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
