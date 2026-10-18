import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { env } from '@/env'

// Better Auth's own connection to the database Payload owns. Payload creates and migrates the
// tables; this pool only reads and writes rows. Cached on globalThis to survive dev HMR.
const globalForDb = globalThis as unknown as { authPool?: Pool }

const pool = globalForDb.authPool ?? new Pool({ connectionString: env.DATABASE_URL, max: 5 })
if (env.NODE_ENV !== 'production') globalForDb.authPool = pool

export const db = drizzle({ client: pool })
