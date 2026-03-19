'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell } from 'lucide-react'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from '../ui/alert-dialog'

export default function ActiveWorkoutDialog() {
	const router = useRouter()
	const pathname = usePathname()
	const activeWorkoutId = useWorkoutSessionStore(s => s.activeWorkoutId)
	const clear = useWorkoutSessionStore(s => s.clear)

	if (!activeWorkoutId) {
		return null
	}

	const shouldPrompt = !pathname.startsWith('/workout-session') && !pathname.startsWith('/auth')

	return (
		<AlertDialog open={shouldPrompt}>
			<AlertDialogContent size='sm'>
				<AlertDialogHeader>
					<AlertDialogTitle>Active workout found</AlertDialogTitle>
					<AlertDialogDescription>
						You have an unfinished workout. Resume it or abandon and clear it from local state.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						variant='destructive'
						onClick={() => {
							clear()
						}}>
						Abandon workout
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							router.push(`/workout-session/${activeWorkoutId}`)
						}}>
						Resume workout
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
