import type { CollectionConfig } from 'payload'
import { createFolderField, createTagField } from 'payload'

import { anyone, isStaff } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: 'alt', type: 'text', required: true, localized: true },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  // Image variants are configured on the sharp transformer in payload.config.ts
  upload: true,
}
