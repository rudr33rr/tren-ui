import { auth } from '@/lib/auth/server'

export async function getCurrentUserId(): Promise<string> {
	const { data: session } = await auth.getSession()
	if (!session?.user?.id) {
		throw new Error('Unauthorized')
	}
	return session.user.id
}
