import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
	const supabase = await createClient()

	const { data, error } = await supabase.auth.getClaims()
	if (error || !data?.claims) {
		redirect('/auth/login')
	}

	return (
		<div className='p-4'>
			<h1 className='text-2xl font-medium'>Dashboard</h1>
		</div>
	)
}
