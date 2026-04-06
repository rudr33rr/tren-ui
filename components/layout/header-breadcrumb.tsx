'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
type Crumb = {
	label: string
	href?: string
}

const SEGMENT_LABELS: Record<string, string> = {
	dashboard: 'Home',
	workouts: 'Workouts',
	plans: 'Plans',
	exercises: 'Exercises',
	'add-workout': 'New Workout',
	'add-plan': 'New Plan',
}

const DETAIL_LABELS: Record<string, string> = {
	exercises: 'Exercise',
}

function buildCrumbs(pathname: string): Crumb[] {
	const segments = pathname.split('/').filter(Boolean)
	const crumbs: Crumb[] = []

	let path = ''
	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i]
		path += `/${seg}`

		if (/^\d+$/.test(seg)) {
			const parent = segments[i - 1]
			const label = DETAIL_LABELS[parent] ?? 'Detail'
			crumbs.push({ label })
			continue
		}

		if (seg === 'edit') {
			const parent = segments[i - 1]
			const label =
				parent === 'workouts' ? 'Edit Workout'
				: parent === 'plans' ? 'Edit Plan'
				: 'Edit'
			crumbs.push({ label })
			break
		}

		const label = SEGMENT_LABELS[seg] ?? seg
		const isLast = i === segments.length - 1
		crumbs.push({ label, href: isLast ? undefined : path })
	}

	return crumbs
}

export function HeaderBreadcrumbs() {
	const pathname = usePathname()
	const crumbs = buildCrumbs(pathname)

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{crumbs.map((crumb, i) => {
					const isLast = i === crumbs.length - 1
					const label = crumb.label

					return (
						<span key={i} className='flex items-center gap-1.5'>
							{i > 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								{isLast || !crumb.href ? (
									<BreadcrumbPage>{label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={crumb.href}>{label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</span>
					)
				})}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
