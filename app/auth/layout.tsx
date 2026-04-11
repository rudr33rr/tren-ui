import { Dumbbell } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-background text-foreground flex flex-col px-6'>
			<div className='flex flex-col items-center justify-center pt-20 pb-10 gap-5'>
				<div className='flex size-16 items-center justify-center rounded-2xl bg-primary'>
					<Dumbbell className='size-8 text-primary-foreground' strokeWidth={1.5} />
				</div>
				<div className='text-center space-y-1'>
					<h1 className='text-4xl font-black tracking-tight'>TrenUI</h1>
				</div>
			</div>

			<div className='w-full max-w-sm mx-auto flex-1 pb-12'>
				{children}
			</div>
		</div>
	)
}
