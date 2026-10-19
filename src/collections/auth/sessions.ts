import type { CollectionConfig } from 'payload'

import { canManageStudents, never } from '@/access'

// Better Auth `session` model. Hidden from the admin navigation; managed by Better Auth.
export const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: { hidden: true, useAsTitle: 'id' },
  access: {
    read: canManageStudents,
    create: () => false,
    update: () => false,
    delete: canManageStudents,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'token', type: 'text', required: true, unique: true, access: { read: never } },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'ipAddress', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
}
