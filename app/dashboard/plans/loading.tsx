import { Skeleton } from '@/components/ui/skeleton'

export default function PlansLoading() {
	return (
		<div className='w-full space-y-6 p-4'>
			<div className='flex w-full justify-between'>
				<Skeleton className='h-8 w-24' />
				<Skeleton className='h-9 w-32' />
			</div>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='rounded-xl border px-5 py-4 space-y-3'>
						<Skeleton className='h-6 w-2/3' />
						<Skeleton className='h-4 w-1/3' />
						<div className='space-y-2 pt-2'>
							{Array.from({ length: 4 }).map((_, j) => (
								<Skeleton key={j} className='h-4 w-full' />
							))}
						</div>
						<Skeleton className='h-9 w-full mt-2' />
					</div>
				))}
			</div>
		</div>
	)
}
