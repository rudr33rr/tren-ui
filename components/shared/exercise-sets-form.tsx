'use client'

import { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Table, TableCell } from '../ui/table'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'

export function ExerciseSetsForm({ exerciseId }: { exerciseId: number }) {
	const [setsCount, setSetsCount] = useState<number>(3)
	const [reps, setReps] = useState<number>(10)

	const upsertExercise = useWorkoutSessionStore(s => s.upsertExercise)

	useEffect(() => {
		const sets = Array.from({ length: setsCount }).map(() => ({
			reps,
		}))

		upsertExercise({
			exerciseId,
			sets,
		})
	}, [exerciseId, reps, setsCount, upsertExercise])

	return (
		<TableCell className='flex gap-3 items-center'>
			<Input
				type='number'
				min={1}
				value={setsCount}
				placeholder='sets'
				onChange={e => setSetsCount(Number(e.target.value))}
				className='w-20'
			/>

			<Input
				type='number'
				min={1}
				value={reps}
				placeholder='reps'
				onChange={e => setReps(Number(e.target.value))}
				className='w-20'
			/>
		</TableCell>
	)
}
