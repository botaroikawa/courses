import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { contentEditor } from '@/editor'
import { reservedSlugs } from '@/lib/paths'
import { pagePreview } from '@/lib/preview'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: { url: ({ data, locale }) => pagePreview(data, locale.code) },
    preview: (doc, { locale }) => pagePreview(doc, locale),
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  versions: {
    drafts: {
      autosave: { interval: 1000 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    // Shared by every locale and written in English: URLs are English everywhere.
    // `home` is rendered at the site root.
    {
      name: 'slug',
      type: 'slug',
      useAsSlug: 'title',
      // The app owns these first segments (/courses, /account…): a page there would never show
      validate: (value: string | null | undefined) =>
        value && reservedSlugs.includes(value.split('/')[0] ?? '')
          ? `"${value}" is taken by the site itself. Choose another slug.`
          : true,
    },
    { name: 'content', type: 'richText', localized: true, editor: contentEditor },
  ],
}
