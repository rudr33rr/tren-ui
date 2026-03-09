import { Calendar, Home, Dumbbell, TrendingUp } from 'lucide-react'
import Link from 'next/link'

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'

const items = [
	{
		title: 'Dashboard',
		url: '/dashboard',
		icon: Home,
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
	{
		title: 'Progress',
		url: '/dashboard/progress',
		icon: TrendingUp,
	},
]

export function AppSidebar() {
	return (
		<Sidebar variant='inset'>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>TrenUI</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map(item => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
