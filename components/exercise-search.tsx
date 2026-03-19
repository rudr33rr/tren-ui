'use client'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Search, LayoutGrid } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { exerciseTypeConfig, exerciseTypes, isExerciseType } from '@/lib/exerciseTypeIcons'
import { useSearchParams, useRouter } from 'next/navigation'
import type { MuscleGroup } from '@/types/view'

type Props = {
	muscles: MuscleGroup[]
	musclesError: boolean
}

export function ExerciseSearch({ muscles, musclesError }: Props) {
	const router = useRouter()
	const params = useSearchParams()
	const typeParam = params.get('type')
	const activeType = typeParam && isExerciseType(typeParam) ? typeParam : null

	function setParam(key: string, value?: string) {
		const sp = new URLSearchParams(params.toString())

		if (!value) sp.delete(key)
		else sp.set(key, value)

		router.replace(`?${sp.toString()}`)
	}

	return (
		<div className='flex flex-col gap-2 mt-2'>
			<div className='flex gap-2'>
				<InputGroup>
					<InputGroupInput
						placeholder='Search exercises...'
						defaultValue={params.get('search') ?? ''}
						onChange={e => setParam('search', e.target.value)}
					/>
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
				</InputGroup>
				<Select
					disabled={musclesError}
					defaultValue={params.get('muscle') ?? undefined}
					onValueChange={value => {
						if (value === '__all__') {
							setParam('muscle', undefined)
						} else {
							setParam('muscle', value)
						}
					}}>
					<SelectTrigger className='w-36'>
						<SelectValue placeholder='muscle' />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Primary muscle</SelectLabel>
							<SelectItem value='__all__'>All muscles</SelectItem>
							{muscles.map(mscl => (
								<SelectItem key={mscl.id} value={String(mscl.id)}>
									{mscl.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<ScrollArea className='w-full touch-pan-x' orientation='horizontal' scrollbarClassName='h-1.5'>
				<ToggleGroup
					className='min-w-max mb-2'
					size={'sm'}
					type='single'
					value={activeType ?? '__all__'}
					spacing={2}
					variant='outline'
					onValueChange={value => {
						if (!value || value === '__all__') {
							setParam('type', undefined)
						} else {
							setParam('type', value)
						}
					}}>
					<ToggleGroupItem value='__all__' aria-label='All categories'>
						<LayoutGrid className='h-2 w-2' />
						All Categories
					</ToggleGroupItem>

					{exerciseTypes.map(type => {
						const Icon = exerciseTypeConfig[type].icon

						return (
							<ToggleGroupItem key={type} value={type} aria-label={exerciseTypeConfig[type].label}>
								<Icon className='h-2 w-2' />
								{exerciseTypeConfig[type].label}
							</ToggleGroupItem>
						)
					})}
				</ToggleGroup>
			</ScrollArea>
		</div>
	)
}
