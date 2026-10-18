import type { CollectionConfig, Field } from 'payload'

import { isAdmin, never } from '@/access'

const secret = (name: string, type: 'text' | 'date' = 'text'): Field =>
  ({
    name,
    type,
    access: { read: never, update: never },
    admin: { hidden: true },
  }) as Field

// Better Auth `account` model: one row per login method (credential, google, github).
// Hidden from the admin navigation; secrets are never readable through Payload.
export const Accounts: CollectionConfig = {
  slug: 'accounts',
  admin: { hidden: true, useAsTitle: 'providerId' },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'accountId', type: 'text', required: true },
    { name: 'providerId', type: 'text', required: true },
    secret('accessToken'),
    secret('refreshToken'),
    secret('idToken'),
    secret('accessTokenExpiresAt', 'date'),
    secret('refreshTokenExpiresAt', 'date'),
    { name: 'scope', type: 'text' },
    secret('password'),
  ],
}
