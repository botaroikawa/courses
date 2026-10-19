import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { contentEditor } from '@/editor'
import { isLocale } from '@/i18n/routing'
import { pagePath } from '@/lib/paths'

const previewUrl = ({
  data,
  locale,
}: {
  data: Record<string, unknown>
  locale: { code: string }
}) => {
  if (typeof data.slug !== 'string' || !isLocale(locale.code)) return null
  const path = pagePath(data.slug, locale.code)
  return `${process.env.NEXT_PUBLIC_SITE_URL}/api/preview?path=${encodeURIComponent(path)}`
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: { url: previewUrl },
    preview: (data, { locale }) => previewUrl({ data, locale: { code: locale } }),
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
    { name: 'slug', type: 'slug', useAsSlug: 'title' },
    { name: 'content', type: 'richText', localized: true, editor: contentEditor },
  ],
}
