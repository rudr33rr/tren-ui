'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EllipsisVertical, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { deletePlan } from '../actions/plans.client'

export function PlanCardActions({ planId }: { planId: number }) {
	const supabase = createClient()
	const router = useRouter()
	const [deleting, setDeleting] = useState(false)

	async function handleDelete() {
		if (deleting) return
		const confirmed = window.confirm('Delete this plan?')
		if (!confirmed) return

		setDeleting(true)
		try {
			await deletePlan(supabase, planId)
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
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon' aria-label='Plan actions' disabled={deleting}>
					<EllipsisVertical />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-36'>
				<DropdownMenuItem
					disabled={deleting}
					onSelect={() => {
						void handleDelete()
					}}
					className='text-destructive focus:text-destructive'>
					<Trash className='h-4 w-4' />
					<span>{deleting ? 'Deleting...' : 'Delete'}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
