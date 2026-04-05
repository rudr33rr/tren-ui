'use client'

import { usePathname } from 'next/navigation'

const LABELS: Record<string, string> = {
	dashboard: 'Home',
	workouts: 'Workouts',
	exercises: 'Exercises',
	progress: 'Progress',
}

export function HeaderBreadcrumbs() {
	const pathname = usePathname()

	const segment = pathname.split('/').filter(Boolean)[1] ?? 'dashboard'
	const label = LABELS[segment] ?? 'Home'

	return (
		<div className="text-sm font-medium text-foreground">
			{label}
		</div>
	)
}
