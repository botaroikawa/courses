import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminOrSelf, isStaff } from '@/access'

// Staff accounts for the Payload admin panel. Students live in `users` (Better Auth).
export const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    group: 'Staff',
  },
  auth: true,
  access: {
    read: isStaff,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The first admin created through "create first user" must be able to manage everything
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({
          collection: 'admins',
          overrideAccess: true,
          req,
        })
        if (totalDocs === 0) data.role = 'admin'
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: { update: isAdminField },
      admin: { position: 'sidebar' },
    },
  ],
}
