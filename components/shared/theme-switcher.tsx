'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeSwitcher() {
	const [mounted, setMounted] = useState(false)
	const { theme, setTheme } = useTheme()

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	const iconSize = 16

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='sm'>
					{theme === 'light' ? (
						<Sun key='light' size={iconSize} className='text-muted-foreground' />
					) : theme === 'dark' ? (
						<Moon key='dark' size={iconSize} className='text-muted-foreground' />
					) : (
						<Laptop key='system' size={iconSize} className='text-muted-foreground' />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-content' align='start'>
				<DropdownMenuRadioGroup value={theme} onValueChange={value => setTheme(value)}>
					<DropdownMenuRadioItem className='flex gap-2' value='light'>
						<Sun size={iconSize} className='text-muted-foreground' />
						<span>Light</span>
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem className='flex gap-2' value='dark'>
						<Moon size={iconSize} className='text-muted-foreground' />
						<span>Dark</span>
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem className='flex gap-2' value='system'>
						<Laptop size={iconSize} className='text-muted-foreground' />
						<span>System</span>
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
