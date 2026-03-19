'use client'

import { Input } from '@/components/ui/input'
import { useCreateWorkoutStore } from '@/stores/createWorkout.store'

export function AddWorkoutNameInput() {
	const name = useCreateWorkoutStore(state => state.name)
	const setName = useCreateWorkoutStore(state => state.setName)

	return (
		<Input
			type='text'
			placeholder='Workout name...'
			value={name}
			onChange={e => setName(e.target.value)}
			className='h-auto rounded-none border-0 border-b border-border/35 px-0 py-2 text-xl font-medium md:text-xl shadow-none focus-visible:border-b focus-visible:border-foreground/40 focus-visible:ring-0'
		/>
	)
}
