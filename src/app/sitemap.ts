import type { MetadataRoute } from 'next'

import { type Locale, locales } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/content'
import { absoluteUrl, alternatesFor } from '@/lib/seo'

export const dynamic = 'force-dynamic'

// One entry per published locale of each page, with hreflang alternates
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const published = new Map<string, { locales: Locale[]; updatedAt: string }>()

  for (const locale of locales) {
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
      pagination: false,
      depth: 0,
    })
    for (const page of docs) {
      const entry = published.get(page.slug) ?? { locales: [], updatedAt: page.updatedAt }
      entry.locales.push(locale)
      published.set(page.slug, entry)
    }
  }

  return [...published].flatMap(([slug, { locales: pageLocales, updatedAt }]) =>
    pageLocales.map((locale) => ({
      url: absoluteUrl(slug, locale),
      lastModified: updatedAt,
      alternates: {
        languages: alternatesFor(slug, locale, pageLocales).languages as Record<string, string>,
      },
    })),
  )
}
