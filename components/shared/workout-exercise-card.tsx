'use client'

import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { Trash, Plus } from 'lucide-react'
import { useWorkoutSessionStore } from '@/stores/workoutSession.store'

type SetData = {
	reps: number
	weight: number
	intensity: number
}

export function WorkoutExerciseCard({ exerciseId, exerciseName }: { exerciseId: number; exerciseName: string }) {
	const upsertExercise = useWorkoutSessionStore(s => s.upsertExercise)

	const [sets, setSets] = useState<SetData[]>([
		{ reps: 0, weight: 0, intensity: 5 },
		{ reps: 0, weight: 0, intensity: 5 },
		{ reps: 0, weight: 0, intensity: 5 },
	])
	const [notes, setNotes] = useState('')
	const [showNotes, setShowNotes] = useState(false)

	const completedSets = sets.filter(set => set.reps > 0).length

	const updateSet = (index: number, field: keyof SetData, value: number) => {
		const newSets = sets.map((s, i) => (i === index ? { ...s, [field]: value } : s))
		setSets(newSets)

		upsertExercise({
			exerciseId,
			sets: newSets,
			notes: notes || undefined,
		})
	}

	const addSet = () => {
		const newSets = [...sets, { reps: 0, weight: 0, intensity: 5 }]
		setSets(newSets)

		upsertExercise({
			exerciseId,
			sets: newSets,
			notes: notes || undefined,
		})
	}

	const removeSet = (index: number) => {
		if (sets.length === 1) return

		const newSets = sets.filter((_, i) => i !== index)
		setSets(newSets)

		upsertExercise({
			exerciseId,
			sets: newSets,
			notes: notes || undefined,
		})
	}

	const updateNotes = (value: string) => {
		setNotes(value)
		upsertExercise({
			exerciseId,
			sets,
			notes: value || undefined,
		})
	}

	return (
		<div className='space-y-2'>
			<div className='flex items-center gap-2'>
				<h3 className='text-xl font-medium'>{exerciseName}</h3>
				<p className='text-xs text-muted-foreground'>
					{completedSets} / {sets.length} sets completed
				</p>
			</div>
			{sets.map((set, index) => (
				<div key={index} className='flex gap-8 items-center'>
					<Input
						type='number'
						placeholder='Reps'
						value={set.reps || ''}
						onChange={e => updateSet(index, 'reps', Number(e.target.value))}
					/>
					<Input
						type='number'
						placeholder='Weight'
						value={set.weight || ''}
						onChange={e => updateSet(index, 'weight', Number(e.target.value))}
					/>
					<div className='grid w-full gap-1'>
						<div className='flex items-center justify-between gap-2'>
							<Label className='text-muted-foreground'>Intensity</Label>
							<span className='text-muted-foreground text-sm'>{set.intensity}</span>
						</div>
						<Slider
							value={[set.intensity]}
							onValueChange={([value]) => updateSet(index, 'intensity', value)}
							max={10}
							min={1}
							step={1}
						/>
					</div>
					<button onClick={() => removeSet(index)} disabled={sets.length === 1} className='disabled:opacity-30'>
						<Trash className='h-6 w-6' />
					</button>
				</div>
			))}

			<Button variant='outline' className='w-full mt-2 opacity-60 border-dashed' onClick={addSet}>
				Add set <Plus />
			</Button>

			<div className='flex items-center mt-2 gap-4'>
				<Label htmlFor={`notes-toggle-${exerciseId}`} className='text-muted-foreground cursor-pointer'>
					Add exercise notes
				</Label>
				<Switch id={`notes-toggle-${exerciseId}`} checked={showNotes} onCheckedChange={setShowNotes} size='sm' />
			</div>

			{showNotes && (
				<div className='mt-4'>
					<Textarea
						placeholder='Type your notes here...'
						className='mt-1'
						value={notes}
						onChange={e => updateNotes(e.target.value)}
					/>
				</div>
			)}
		</div>
	)
}
