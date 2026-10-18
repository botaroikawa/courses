import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff } from '@/access'
import { defaultLocale, locales } from '@/i18n/routing'
import { motionPreferences, themePreferences } from '@/lib/preferences/options'

// Students. Rows are written by Better Auth (see src/lib/auth.ts) and managed by staff from the
// admin panel. Field names mirror Better Auth's `user` model; keep both in sync and regenerate
// the Drizzle schema (`pnpm generate:db-schema`) after changing them.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'emailVerified', 'createdAt'],
    group: 'Students',
  },
  access: {
    read: isStaff,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    // Deleting from the admin panel must not leave orphaned credentials or sessions behind
    beforeDelete: [
      async ({ id, req }) => {
        for (const collection of ['sessions', 'accounts'] as const) {
          await req.payload.delete({
            collection,
            where: { user: { equals: id } },
            overrideAccess: true,
            req,
          })
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'emailVerified', type: 'checkbox', required: true, defaultValue: false },
    { name: 'image', type: 'text' },
    {
      type: 'collapsible',
      label: 'Preferences',
      fields: [
        {
          name: 'locale',
          type: 'select',
          required: true,
          defaultValue: defaultLocale,
          options: [...locales],
        },
        {
          name: 'motionPreference',
          type: 'select',
          required: true,
          defaultValue: 'system',
          options: [...motionPreferences],
        },
        {
          name: 'themePreference',
          type: 'select',
          required: true,
          defaultValue: 'system',
          options: [...themePreferences],
        },
      ],
    },
  ],
}
