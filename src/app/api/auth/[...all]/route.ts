import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/lib/auth'

// Takes precedence over Payload's catch-all `/api/[...slug]` because `auth` is a static segment
export const { GET, POST } = toNextJsHandler(auth)
