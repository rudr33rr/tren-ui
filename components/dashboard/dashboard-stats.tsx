import { BarChart2, CalendarDays, TrendingUp } from 'lucide-react'
import { Item } from '@/components/ui/item'
import type { DashboardStats } from '@/data/dashboard.server'

export function DashboardStats({ stats }: { stats: DashboardStats }) {
	return (
		<div className='grid grid-cols-3 gap-3'>
			<StatCard icon={<BarChart2 className='w-4 h-4' />} label='Total workouts' value={stats.totalSessions} />
			<StatCard icon={<CalendarDays className='w-4 h-4' />} label='This week' value={stats.thisWeekSessions} />
			<StatCard icon={<TrendingUp className='w-4 h-4' />} label='This month' value={stats.thisMonthSessions} />
		</div>
	)
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
	return (
		<Item variant='outline' className='flex-col items-start gap-1'>
			<div className='flex items-center gap-2 text-muted-foreground text-sm'>
				{icon}
				{label}
			</div>
			<p className='text-2xl font-bold'>{value}</p>
		</Item>
	)
}
