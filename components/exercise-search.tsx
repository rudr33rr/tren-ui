'use client'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Search } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useSearchParams, useRouter } from 'next/navigation'
import type { MuscleGroup } from '@/types/view'

type Props = {
	muscles: MuscleGroup[]
	musclesError: boolean
}

export function ExerciseSearch({ muscles, musclesError }: Props) {
	const router = useRouter()
	const params = useSearchParams()

	function setParam(key: string, value?: string) {
		const sp = new URLSearchParams(params.toString())

		if (!value) sp.delete(key)
		else sp.set(key, value)

		router.replace(`?${sp.toString()}`)
	}

	return (
		<div className='flex gap-2'>
			<InputGroup>
				<InputGroupInput
					placeholder='Search...'
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
	)
}
