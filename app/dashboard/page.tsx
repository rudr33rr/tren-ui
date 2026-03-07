// TODO: Replace with Drizzle queries
export default async function DashboardPage() {
	return (
		<div className='w-full p-4 space-y-6'>
			<h1 className='text-2xl font-medium'>Dashboard</h1>

			<section className='rounded-lg border p-4'>
				<h2 className='text-lg font-medium mb-2'>Last completed workout</h2>
				<p className='text-sm opacity-60'>No completed workouts yet.</p>
			</section>
		</div>
	)
}
