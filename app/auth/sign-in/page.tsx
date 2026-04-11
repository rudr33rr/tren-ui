'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signInWithEmail } from './actions'

export default function SignInPage() {
	const [state, formAction, isPending] = useActionState(signInWithEmail, null)

	return (
		<form action={formAction} className='flex flex-col gap-6'>
			<div className='space-y-1'>
				<h2 className='text-xl font-bold'>Welcome back</h2>
				<p className='text-muted-foreground text-sm'>Sign in to your account to continue.</p>
			</div>

			<div className='flex flex-col gap-4'>
				<div className='flex flex-col gap-1.5'>
					<label htmlFor='email' className='text-xs font-medium uppercase tracking-widest text-muted-foreground'>
						Email
					</label>
					<input
						id='email'
						name='email'
						type='email'
						required
						placeholder='you@example.com'
						className='w-full bg-muted border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-all text-sm'
					/>
				</div>

				<div className='flex flex-col gap-1.5'>
					<label htmlFor='password' className='text-xs font-medium uppercase tracking-widest text-muted-foreground'>
						Password
					</label>
					<input
						id='password'
						name='password'
						type='password'
						required
						placeholder='••••••••'
						className='w-full bg-muted border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-all text-sm'
					/>
				</div>
			</div>

			{state?.error && (
				<p className='text-sm text-destructive'>{state.error}</p>
			)}

			<button
				type='submit'
				disabled={isPending}
				className='w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm disabled:opacity-50'
			>
				{isPending ? 'Signing in…' : 'Sign in'}
			</button>

			<p className='text-sm text-center text-muted-foreground'>
				Don&apos;t have an account?{' '}
				<Link href='/auth/sign-up' className='text-foreground font-medium hover:underline underline-offset-4'>
					Sign up
				</Link>
			</p>
		</form>
	)
}
