'use client'

import { Calendar, ClipboardList, Dumbbell, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
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
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>TrenUI</SidebarGroupLabel>
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
