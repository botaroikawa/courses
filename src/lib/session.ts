import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'

import { auth } from './auth'

// Authoritative session check (hits the database), deduplicated per request
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }))
