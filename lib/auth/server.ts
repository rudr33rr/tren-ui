import { createNeonAuth } from '@neondatabase/auth/next/server'

export const auth = createNeonAuth({
	baseUrl: process.env.VITE_NEON_AUTH_URL!,
	cookies: {
		secret: process.env.NEON_AUTH_COOKIE_SECRET!,
	},
})
