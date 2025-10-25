'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2, AlertTriangle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/client'

type ExerciseOption = {
	id: number
	name: string
}

export type ExerciseComboboxProps = {
	value: number | null
	onChange: (next: number | null) => void
	disabled?: boolean
	placeholder?: string
}

export function ExerciseCombobox({
	value,
	onChange,
	disabled,
	placeholder = 'Choose exercise',
}: ExerciseComboboxProps) {
	const supabase = React.useMemo(() => createClient(), [])
	const [open, setOpen] = React.useState(false)

	// fetched options
	const [options, setOptions] = React.useState<ExerciseOption[]>([])
	const [loading, setLoading] = React.useState(false)
	const [fetchError, setFetchError] = React.useState<string | null>(null)

	// we lazily fetch when popover first opens
	const didFetchRef = React.useRef(false)
	React.useEffect(() => {
		if (!open) return
		if (didFetchRef.current) return

		const fetchExercises = async () => {
			setLoading(true)
			setFetchError(null)

			const { data, error } = await supabase
				.from('exercises')
				.select('id, exercise_name')
				.order('id', { ascending: true })

			if (error) {
				setFetchError(error.message)
			} else {
				setOptions(
					(data ?? []).map((row: any) => ({
						id: row.id,
						name: row.exercise_name ?? '',
					}))
				)
				didFetchRef.current = true
			}

			setLoading(false)
		}

		fetchExercises()
	}, [open, supabase])

	const selected = options.find(o => o.id === value)

	return (
		<div className='w-full'>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type='button'
						variant='outline'
						role='combobox'
						aria-expanded={open}
						disabled={disabled}
						className='w-full justify-between'>
						<span className={cn('truncate text-left', !selected && 'text-muted-foreground')}>
							{selected ? selected.name : loading ? 'Loading…' : placeholder}
						</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[--radix-popover-trigger-width] p-0 max-h-64 overflow-hidden'>
					<Command>
						<CommandInput placeholder='Search exercise...' className='h-9' disabled={loading} />
						<CommandList className='max-h-56 overflow-y-auto'>
							{loading ? (
								<div className='flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground'>
									<Loader2 className='h-4 w-4 animate-spin' />
									<span>Loading…</span>
								</div>
							) : fetchError ? (
								<div className='flex items-center gap-2 px-3 py-2 text-sm text-destructive'>
									<AlertTriangle className='h-4 w-4' />
									<span>{fetchError}</span>
								</div>
							) : (
								<>
									<CommandEmpty>No exercise found.</CommandEmpty>
									<CommandGroup>
										{options.map(opt => (
											<CommandItem
												key={opt.id}
												value={opt.name}
												onSelect={() => {
													onChange(opt.id)
													setOpen(false)
												}}
												className='flex items-center gap-2'>
												<Check className={cn('h-4 w-4', opt.id === value ? 'opacity-100' : 'opacity-0')} />
												<span className='truncate'>{opt.name}</span>
											</CommandItem>
										))}
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{fetchError ? <p className='text-xs text-destructive mt-1'>{fetchError}</p> : null}
		</div>
	)
}
