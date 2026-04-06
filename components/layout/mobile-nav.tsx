'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, ClipboardList, Dumbbell, Home } from 'lucide-react'

const items = [
	{ title: 'Home', url: '/dashboard', icon: Home },
	{ title: 'Plans', url: '/dashboard/plans', icon: ClipboardList },
	{ title: 'Workouts', url: '/dashboard/workouts', icon: Calendar },
	{ title: 'Exercises', url: '/dashboard/exercises', icon: Dumbbell },
]

export function MobileNav() {
	const pathname = usePathname()

	return (
		<nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background'>
			{items.map(item => {
				const isActive = item.url === '/dashboard'
					? pathname === '/dashboard'
					: pathname.startsWith(item.url)

				return (
					<Link
						key={item.title}
						href={item.url}
						className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
							isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
						}`}>
						<item.icon className='size-5' />
						{item.title}
					</Link>
				)
			})}
		</nav>
	)
}
