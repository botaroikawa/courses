import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'

// One level, one per course. Drag rows in the list view to set their order in the catalogue.
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: 'Courses',
  },
  orderable: true,
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'slug', useAsSlug: 'name' },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: { description: 'Shown on the category page.' },
    },
  ],
}
