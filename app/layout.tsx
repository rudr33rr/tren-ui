import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import ActiveWorkoutDialog from '@/components/shared/active-workout-dialog'
import './globals.css'

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: 'TrenUI',
	description: 'Description',
	manifest: '/site.webmanifest',
	icons: {
		apple: '/apple-touch-icon.png',
	},
}

const geistSans = Geist({
	variable: '--font-geist-sans',
	display: 'swap',
	subsets: ['latin'],
})

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={`${geistSans.className} antialiased`}>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
					{children}
					<ActiveWorkoutDialog />
				</ThemeProvider>
			</body>
		</html>
	)
}
