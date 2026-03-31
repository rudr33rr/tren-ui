'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { setActivePlan, deactivatePlan } from '../actions/plans.client'

export function SetActivePlanButton({ planId, isActive }: { planId: number; isActive: boolean }) {
	const supabase = createClient()
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	async function handleToggle() {
		if (loading) return
		setLoading(true)
		try {
			if (isActive) {
				await deactivatePlan(supabase, planId)
				toast.success('Plan deactivated')
			} else {
				await setActivePlan(supabase, planId)
				toast.success('Plan set as active')
			}
			router.refresh()
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update plan.'
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Button variant={isActive ? 'outline' : 'default'} size='sm' className='w-full' onClick={handleToggle} disabled={loading}>
			{loading ? '...' : isActive ? 'Deactivate' : 'Set as active'}
		</Button>
	)
}
