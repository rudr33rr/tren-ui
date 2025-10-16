import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/shared/app-sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className='min-h-screen flex flex-col w-full p-4 gap-2'>
				<SidebarTrigger />
				{children}
			</main>
		</SidebarProvider>
	)
}
