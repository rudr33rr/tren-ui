import { getAuth } from '@/lib/auth/server'

export const { GET, POST } = getAuth().handler()
