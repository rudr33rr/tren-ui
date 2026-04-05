import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
	return (
		<div className='w-full p-4 space-y-4'>
			<Skeleton className='h-8 w-24' />

			<div className='grid grid-cols-3 gap-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='rounded-xl border px-5 py-4 space-y-2'>
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-8 w-1/3' />
					</div>
				))}
			</div>

			<div className='rounded-xl border px-5 py-4 space-y-3'>
				<Skeleton className='h-5 w-32' />
				<Skeleton className='h-5 w-48' />
				<Skeleton className='h-4 w-24' />
				<Skeleton className='h-9 w-32' />
			</div>
		</div>
	)
}
