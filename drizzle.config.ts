import type { Config } from 'drizzle-kit'

// drizzle-kit doesn't load .env.local automatically — use dotenv
import { config } from 'dotenv'
config({ path: '.env.local' })

export default {
	schema: './db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
} satisfies Config
