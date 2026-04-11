'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Laptop, LogOut, Moon, Sun } from 'lucide-react'

import { authClient } from '@/lib/auth/client'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const THEME_ICON_SIZE = 14

function ThemeIcon({ theme }: { theme: string | undefined }) {
	if (theme === 'light') return <Sun size={THEME_ICON_SIZE} className='text-muted-foreground' />
	if (theme === 'dark') return <Moon size={THEME_ICON_SIZE} className='text-muted-foreground' />
	return <Laptop size={THEME_ICON_SIZE} className='text-muted-foreground' />
}

export function UserMenu({ initialName }: { initialName: string }) {
	const { data: session } = authClient.useSession()
	const router = useRouter()
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => setMounted(true), [])

	const name = session?.user?.name ?? initialName
	const initial = name.charAt(0).toUpperCase()

	async function handleSignOut() {
		await authClient.signOut()
		router.push('/auth/sign-in')
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className='flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium select-none cursor-pointer'>
					{initial || '?'}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='min-w-44'>
				{name && (
					<div className='px-2 py-1.5 text-sm font-medium text-foreground'>{name}</div>
				)}
				<DropdownMenuSeparator />
				{mounted && (
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className='flex items-center gap-2'>
							<ThemeIcon theme={theme} />
							<span>Theme</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
								<DropdownMenuRadioItem value='light' className='flex gap-2'>
									<Sun size={THEME_ICON_SIZE} className='text-muted-foreground' />
									Light
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value='dark' className='flex gap-2'>
									<Moon size={THEME_ICON_SIZE} className='text-muted-foreground' />
									Dark
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value='system' className='flex gap-2'>
									<Laptop size={THEME_ICON_SIZE} className='text-muted-foreground' />
									System
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleSignOut}
					className='flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10'
				>
					<LogOut size={14} />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
