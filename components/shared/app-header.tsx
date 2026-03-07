import { ThemeSwitcher } from './theme-switcher'
import { SidebarTrigger } from '../ui/sidebar'
import { HeaderBreadcrumbs } from './header-breadcrumb'

export function AppHeader() {
	return (
		<header className='w-full border-b p-2 flex items-center justify-between gap-2'>
			<div className='flex items-center gap-2'>
				<SidebarTrigger />
				<div className='w-px h-4 bg-border' />
				<HeaderBreadcrumbs />
			</div>
			<ThemeSwitcher />
		</header>
	)
}
