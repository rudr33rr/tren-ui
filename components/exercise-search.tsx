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
import { useState, useCallback, useEffect } from 'react'
import type { MuscleOption } from '@/types/view'

const SEARCH_DEBOUNCE_MS = 300

type Props = {
	muscles: MuscleOption[]
}

export function ExerciseSearch({ muscles }: Props) {
	const router = useRouter()
	const params = useSearchParams()
	const searchParam = params.get('search') ?? ''
	const [searchValue, setSearchValue] = useState(searchParam)

	const setParam = useCallback(
		(key: string, value?: string) => {
			const sp = new URLSearchParams(params.toString())
			if (!value) sp.delete(key)
			else sp.set(key, value)

			const next = sp.toString()
			const current = params.toString()
			if (next === current) return

			router.replace(next ? `?${next}` : '?')
		},
		[params, router],
	)

	useEffect(() => {
		const handle = window.setTimeout(() => {
			const normalized = searchValue.trim()
			setParam('search', normalized || undefined)
		}, SEARCH_DEBOUNCE_MS)

		return () => window.clearTimeout(handle)
	}, [searchValue, setParam])

	useEffect(() => {
		setSearchValue(prev => (prev === searchParam ? prev : searchParam))
	}, [searchParam])

	return (
		<div className='flex gap-2'>
			<InputGroup>
				<InputGroupInput placeholder='Search...' value={searchValue} onChange={e => setSearchValue(e.target.value)} />
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
			</InputGroup>

			<Select
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
