'use client'

import { useState } from 'react'
import { Input } from '../ui/input'

export function ExerciseSetsForm() {
	const [sets, setSets] = useState<number>(3)
	const [reps, setReps] = useState<number>(10)

	return (
		<div className='flex gap-3 items-center'>
			<Input
				type='number'
				min={1}
				value={sets}
				placeholder='sets'
				onChange={e => setSets(Number(e.target.value))}
				className='w-20'
			/>

			<Input
				type='number'
				min={1}
				value={reps}
				placeholder='count'
				onChange={e => setReps(Number(e.target.value))}
				className='w-20'
			/>
		</div>
	)
}
