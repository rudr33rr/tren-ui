'use client'

import * as React from 'react'
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

type Props = {
	muscles: { id: number; name: string }[]
	musclesError: boolean
}

export function ExerciseSearch({ muscles, musclesError }: Props) {
	const router = useRouter()
	const params = useSearchParams()
	const searchParam = params.get('search') ?? ''
	const [searchValue, setSearchValue] = React.useState(params.get('search') ?? '')

	const setParam = React.useCallback(
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

	React.useEffect(() => {
		const handle = window.setTimeout(() => {
			const normalized = searchValue.trim()
			setParam('search', normalized || undefined)
		}, 300)

		return () => window.clearTimeout(handle)
	}, [searchValue, setParam])

	React.useEffect(() => {
		setSearchValue(prev => (prev === searchParam ? prev : searchParam))
	}, [searchParam])

	return (
		<div className='flex gap-2'>
			<InputGroup>
				<InputGroupInput
					placeholder='Search...'
					value={searchValue}
					onChange={e => setSearchValue(e.target.value)}
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
				}}
			>
				<SelectTrigger className='w-36'>
					<SelectValue placeholder='muscle' />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Primary muscle</SelectLabel>
						<SelectItem value='__all__'>
							All muscles
						</SelectItem>
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
