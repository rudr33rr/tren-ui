import { type NextRequest } from 'next/server'
import { getAuth } from '@/lib/auth/server'

export default function middleware(req: NextRequest) {
	// Skip auth check for Next.js server action POST requests.
	// Server actions identify themselves with the Next-Action header.
	// Auth is enforced inside each action via getCurrentUserId().
	if (req.headers.get('next-action')) {
		return
	}

	return getAuth().middleware({ loginUrl: '/auth/sign-in' })(req)
}

export const config = {
	matcher: ['/dashboard/:path*', '/workout-session/:path*'],
}
