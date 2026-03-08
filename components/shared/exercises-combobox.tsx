'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { ExerciseOption } from '@/lib/db/exercises'

export type ExerciseComboboxProps = {
	options: ExerciseOption[]
	value: number | null
	onChange: (next: number | null) => void
	disabled?: boolean
	placeholder?: string
}

export function ExerciseCombobox({
	options,
	value,
	onChange,
	disabled,
	placeholder = 'Choose exercise',
}: ExerciseComboboxProps) {
	const [open, setOpen] = React.useState(false)

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
							{selected ? selected.name : placeholder}
						</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[--radix-popover-trigger-width] p-0 max-h-64 overflow-hidden'>
					<Command>
						<CommandInput placeholder='Search exercise...' className='h-9' />
						<CommandList className='max-h-56 overflow-y-auto'>
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
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	)
}
