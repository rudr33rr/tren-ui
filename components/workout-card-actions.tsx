'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EllipsisVertical, SquarePen, Trash } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

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
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				throw userError ?? new Error('User not authenticated.')
			}

			const { data: workout, error: workoutFetchError } = await supabase
				.from('workouts')
				.select('id')
				.eq('id', workoutId)
				.eq('user_id', user.id)
				.maybeSingle()

			if (workoutFetchError) {
				throw workoutFetchError
			}

			if (!workout) {
				throw new Error('Workout not found for current user.')
			}

			const { data: sessions, error: sessionsFetchError } = await supabase
				.from('workout_session')
				.select('id')
				.eq('workout_id', workoutId)
				.eq('user_id', user.id)

			if (sessionsFetchError) {
				throw sessionsFetchError
			}

			const sessionIds = (sessions ?? []).map(session => session.id)

			if (sessionIds.length > 0) {
				const { data: exerciseSessions, error: exerciseSessionsFetchError } = await supabase
					.from('exercise_session')
					.select('id')
					.in('session_id', sessionIds)
					.eq('user_id', user.id)

				if (exerciseSessionsFetchError) {
					throw exerciseSessionsFetchError
				}

				const exerciseSessionIds = (exerciseSessions ?? []).map(exerciseSession => exerciseSession.id)

				if (exerciseSessionIds.length > 0) {
					const { error: exerciseSetDeleteError } = await supabase
						.from('exercise_set')
						.delete()
						.in('session_id', exerciseSessionIds)
						.eq('user_id', user.id)

					if (exerciseSetDeleteError) {
						throw exerciseSetDeleteError
					}
				}

				const { error: exerciseSessionDeleteError } = await supabase
					.from('exercise_session')
					.delete()
					.in('session_id', sessionIds)
					.eq('user_id', user.id)

				if (exerciseSessionDeleteError) {
					throw exerciseSessionDeleteError
				}
			}

			const { error: sessionsDeleteError } = await supabase
				.from('workout_session')
				.delete()
				.eq('workout_id', workoutId)
				.eq('user_id', user.id)

			if (sessionsDeleteError) {
				throw sessionsDeleteError
			}

			const { error: workoutExercisesDeleteError } = await supabase
				.from('workout_exercises')
				.delete()
				.eq('workout_id', workoutId)

			if (workoutExercisesDeleteError) {
				throw workoutExercisesDeleteError
			}

			const { error: workoutDeleteError } = await supabase
				.from('workouts')
				.delete()
				.eq('id', workoutId)
				.eq('user_id', user.id)

			if (workoutDeleteError) {
				throw workoutDeleteError
			}

			router.refresh()
		} catch (error) {
			console.error('Failed to delete workout:', error)
			setErrorMessage(error instanceof Error ? error.message : 'Failed to delete workout.')
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
