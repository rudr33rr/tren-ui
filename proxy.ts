import { NextResponse, type NextRequest } from 'next/server'

// TODO: Replace with real auth middleware
export async function proxy(request: NextRequest) {
	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
