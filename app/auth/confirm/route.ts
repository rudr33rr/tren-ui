import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

// TODO: Implement email verification with new auth
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const next = searchParams.get('next') ?? '/'

	redirect(next)
}
