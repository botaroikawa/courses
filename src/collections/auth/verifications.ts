import type { CollectionConfig } from 'payload'

import { isAdmin, never } from '@/access'

// Better Auth `verification` model: email verification, magic link and password reset tokens
export const Verifications: CollectionConfig = {
  slug: 'verifications',
  admin: { hidden: true },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: 'identifier', type: 'text', required: true, index: true },
    { name: 'value', type: 'text', required: true, access: { read: never } },
    { name: 'expiresAt', type: 'date', required: true },
  ],
}
