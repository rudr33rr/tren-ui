import { Calendar, Home, Dumbbell, TrendingUp } from 'lucide-react'

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
		title: 'My Plan',
		url: '/dashboard/my-plan',
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
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
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
