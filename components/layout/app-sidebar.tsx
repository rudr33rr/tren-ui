'use client'

import { Calendar, ClipboardList, Dumbbell, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'

const items = [
	{
		title: 'Home',
		url: '/dashboard',
		icon: Home,
	},
	{
		title: 'Plans',
		url: '/dashboard/plans',
		icon: ClipboardList,
	},
	{
		title: 'Workouts',
		url: '/dashboard/workouts',
		icon: Calendar,
	},
	{
		title: 'Exercises',
		url: '/dashboard/exercises',
		icon: Dumbbell,
	},
]

export function AppSidebar() {
	const { setOpenMobile } = useSidebar()
	const pathname = usePathname()

	return (
		<Sidebar variant='inset'>
			<SidebarHeader className='p-4'>
				<div className='flex items-center gap-2'>
					<div className='flex size-8 items-center justify-center rounded-md bg-primary'>
						<Dumbbell className='size-4 text-primary-foreground' />
					</div>
					<span className='text-base font-semibold tracking-tight'>TrenUI</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map(item => {
								const isActive = item.url === '/dashboard'
									? pathname === '/dashboard'
									: pathname.startsWith(item.url)

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={isActive}>
											<Link href={item.url} onClick={() => setOpenMobile(false)}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
