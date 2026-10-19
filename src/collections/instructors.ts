import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'

// Public profiles, unrelated to `admins`: an instructor never needs an admin account
export const Instructors: CollectionConfig = {
  slug: 'instructors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'headline', 'updatedAt'],
    group: 'Courses',
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'slug', useAsSlug: 'name' },
    {
      name: 'headline',
      type: 'text',
      localized: true,
      admin: { description: 'For example "Product designer".' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { like: 'image/' } },
    },
    { name: 'bio', type: 'richText', localized: true },
    {
      name: 'links',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'url',
              type: 'text',
              required: true,
              validate: (value: string | null | undefined) =>
                !value || /^https?:\/\/\S+$/.test(value)
                  ? true
                  : 'Enter a full URL starting with https://',
            },
          ],
        },
      ],
    },
  ],
}
