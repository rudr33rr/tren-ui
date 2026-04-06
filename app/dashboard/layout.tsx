import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='border shadow-2xl'>
				<div className='flex flex-col items-center w-full gap-2'>
					<AppHeader />
					<div className='w-full max-w-7xl pb-20 md:pb-0'>{children}</div>
				</div>
			</SidebarInset>
			<MobileNav />
		</SidebarProvider>
	)
}
