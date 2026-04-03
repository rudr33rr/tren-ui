'use server'

import { auth } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

export async function signInWithEmail(
	_prevState: { error: string } | null,
	formData: FormData,
) {
	let hasError = false
	let errorMessage = ''

	try {
		const { error } = await auth.signIn.email({
			email: formData.get('email') as string,
			password: formData.get('password') as string,
		})

		if (error) {
			hasError = true
			errorMessage = error.message || 'Invalid email or password.'
		}
	} catch (e) {
		hasError = true
		errorMessage = e instanceof Error ? e.message : 'An error occurred. Please try again.'
	}

	if (hasError) {
		return { error: errorMessage }
	}

	redirect('/dashboard')
}
