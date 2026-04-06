import { ThemeSwitcher } from '@/components/layout/theme-switcher'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { HeaderBreadcrumbs } from '@/components/layout/header-breadcrumb'

export function AppHeader() {
	return (
		<header className='w-full border-b p-2 flex items-center justify-between gap-2'>
			<div className='flex items-center gap-2'>
				<SidebarTrigger className='hidden md:flex' />
				<div className='hidden md:block w-px h-4 bg-border' />
				<HeaderBreadcrumbs />
			</div>
			<ThemeSwitcher />
		</header>
	)
}
