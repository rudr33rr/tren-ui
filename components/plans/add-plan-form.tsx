'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { WorkoutCardData } from '@/types/workout.types'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPlan } from '@/data/plans.actions'

const DAYS = [
	{ label: 'Monday', short: 'Mon' },
	{ label: 'Tuesday', short: 'Tue' },
	{ label: 'Wednesday', short: 'Wed' },
	{ label: 'Thursday', short: 'Thu' },
	{ label: 'Friday', short: 'Fri' },
	{ label: 'Saturday', short: 'Sat' },
	{ label: 'Sunday', short: 'Sun' },
]

export function AddPlanForm({ workouts, id }: { workouts: WorkoutCardData[]; id?: string }) {
	const router = useRouter()

	const [name, setName] = useState('')
	const [dayWorkouts, setDayWorkouts] = useState<Record<number, number | null>>({})
	const [saving, setSaving] = useState(false)

	const hasDay = Object.values(dayWorkouts).some(v => v !== null)
	const canSave = name.trim().length > 0 && hasDay && !saving

	function handleDayChange(dayIndex: number, value: string) {
		setDayWorkouts(prev => ({
			...prev,
			[dayIndex]: value === 'rest' ? null : Number(value),
		}))
	}

	async function handleSave() {
		if (!name.trim() || saving) return

		const days = DAYS.flatMap((_, i) => {
			const workoutId = Object.prototype.hasOwnProperty.call(dayWorkouts, i) ? dayWorkouts[i] : null
			if (workoutId === null) return []
			return [{ dayIndex: i, workoutId }]
		})

		setSaving(true)
		try {
			await createPlan({ name: name.trim(), days })
			toast.success('Plan created')
			router.push('/dashboard/plans')
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to create plan.'
			toast.error(message)
			setSaving(false)
		}
	}

	return (
		<form id={id} onSubmit={e => { e.preventDefault(); void handleSave() }} className='flex flex-col gap-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-medium'>New Plan</h1>
				<Button type='submit' disabled={!canSave}><Save className='h-4 w-4' />Save plan</Button>
			</div>
			<Input
				type='text'
				placeholder='Plan name...'
				value={name}
				onChange={e => setName(e.target.value)}
				disabled={saving}
				className='h-auto rounded-none border-0 border-b border-border/35 px-2 py-2 text-xl font-medium md:text-xl shadow-none focus-visible:border-b focus-visible:border-foreground/20 focus-visible:ring-0'
			/>

			<div className='space-y-2'>
				<h2 className='font-medium'>Weekly schedule</h2>
				<div className='grid grid-cols-1 lg:grid-cols-2'>
					{DAYS.map(({ label, short }, i) => {
						const workoutId = dayWorkouts[i] ?? null
						const isActive = workoutId !== null
						const selectValue = isActive ? String(workoutId) : 'rest'

						return (
							<div
								key={i}
								className={`flex items-center gap-4 py-3 border-b border-border/40 lg:odd:border-r lg:odd:border-r-border/40 lg:odd:pr-6 lg:even:pl-6 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
							>
								<div className='flex items-center gap-3 flex-1'>
									<div
										className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
									/>
									<span className='text-sm font-medium hidden sm:block'>{label}</span>
									<span className='text-sm font-medium sm:hidden'>{short}</span>
								</div>
								<div className='relative w-44'>
									<Select
										onValueChange={v => handleDayChange(i, v)}
										value={selectValue}
										disabled={saving}
									>
										<SelectTrigger className={`w-full transition-colors ${isActive ? 'pr-8' : ''} ${!isActive ? 'text-muted-foreground' : ''}`}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='rest'>Rest day</SelectItem>
											{workouts.map(w => (
												<SelectItem key={w.id} value={String(w.id)}>
													{w.name}
													{typeof w.exerciseCount === 'number' && (
														<span className='text-muted-foreground ml-1'>({w.exerciseCount} exercises)</span>
													)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isActive && (
										<button
											type='button'
											onClick={e => { e.stopPropagation(); handleDayChange(i, 'rest') }}
											disabled={saving}
											className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
										>
											<X className='h-4 w-4' />
										</button>
									)}
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</form>
	)
}
