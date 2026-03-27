'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useWorkoutSessionStore } from '@/stores/workout-session.store'
import { Button } from '@/components/ui/button'
import FinishWorkoutButton from './finish-workout-button'
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type WorkoutSessionHeaderProps = {
	workoutId: string
	workoutLabel: string
}

const DEFAULT_SETS_PER_EXERCISE = 3

export default function WorkoutSessionHeader({ workoutId, workoutLabel }: WorkoutSessionHeaderProps) {
	const router = useRouter()
	const activeExercises = useWorkoutSessionStore(s => s.activeExercises)
	const exerciseState = useWorkoutSessionStore(s => s.exercises)
	const setActiveWorkout = useWorkoutSessionStore(s => s.setActiveWorkout)
	const clearWorkoutSession = useWorkoutSessionStore(s => s.clear)

	useEffect(() => {
		const numericWorkoutId = Number(workoutId)

		if (!Number.isFinite(numericWorkoutId) || numericWorkoutId <= 0) return

		setActiveWorkout(numericWorkoutId)
	}, [workoutId, setActiveWorkout])

	const progress = useMemo(() => {
		const totalSets = activeExercises.reduce((sum, exercise) => {
			const sets = exerciseState[exercise.id]?.sets
			return sum + (sets?.length ?? DEFAULT_SETS_PER_EXERCISE)
		}, 0)

		const completedSets = activeExercises.reduce((sum, exercise) => {
			const sets = exerciseState[exercise.id]?.sets ?? []
			return sum + sets.filter(set => set.completed).length
		}, 0)

		const value = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100)

		return {
			completedSets,
			totalSets,
			value,
		}
	}, [exerciseState, activeExercises])

	return (
		<div className='w-full sticky top-0 bg-background z-10'>
			<div className='flex items-center justify-between px-4 py-4 xl:px-8'>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant='ghost' size='icon'>
							<ArrowLeft />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogTitle>Leave workout session</AlertDialogTitle>
						<p>Are you sure you want to leave the workout session?</p>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									clearWorkoutSession()
									router.push('/dashboard/workouts')
								}}>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<h1 className='font-semibold md:text-xl'>
					{workoutLabel}{' '}
					<span className='text-muted-foreground ms-1'>
						({progress.completedSets}/{progress.totalSets})
					</span>
				</h1>
				<FinishWorkoutButton workoutId={workoutId} canSave={progress.value === 100} />
			</div>
			<Progress value={progress.value} className='h-1 rounded-none' />
		</div>
	)
}
