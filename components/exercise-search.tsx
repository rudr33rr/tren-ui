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
import { Button } from './ui/button'
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
		<div className='flex flex-col gap-4'>
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
			<div className='flex flex-wrap gap-3'>
				<Button
					variant={activeType === null ? 'default' : 'outline'}
					type='button'
					onClick={() => setParam('type', undefined)}>
					<LayoutGrid className='h-4 w-4' />
					All Categories
				</Button>

				{exerciseTypes.map(type => {
					const Icon = exerciseTypeConfig[type].icon
					const active = activeType === type

					return (
						<Button
							key={type}
							variant={active ? 'default' : 'outline'}
							type='button'
							onClick={() => setParam('type', type)}>
							<Icon className='h-4 w-4' />
							{exerciseTypeConfig[type].label}
						</Button>
					)
				})}
			</div>
		</div>
	)
}
