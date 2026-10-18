import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'

export const Brand: GlobalConfig = {
  slug: 'brand',
  admin: { group: 'Site' },
  access: { read: anyone, update: isStaff },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'Open Knowledge' },
    { name: 'tagline', type: 'text', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media' },
        {
          name: 'logoDark',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional variant for dark mode' },
        },
      ],
    },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
  ],
}
