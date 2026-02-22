import { Calendar } from '@/components/ui/calendar'

export default async function MyPlanPage() {
	return (
		<div className='w-full space-y-6 p-4'>
			<h1 className='text-2xl font-medium'>My Plan</h1>
			<Calendar />
		</div>
	)
}
