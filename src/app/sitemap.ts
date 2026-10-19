import type { MetadataRoute } from 'next'

import { type Locale, locales } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/content'
import {
  cataloguePath,
  categoryPath,
  coursePath,
  instructorPath,
  lessonPath,
  pageHref,
} from '@/lib/paths'
import { absoluteUrl, alternatesFor } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const published = { _status: { equals: 'published' } } as const

// Everything indexable (docs/product.md#seo), once per locale where it is published, with
// hreflang alternates. Lessons behind sign-in are left out: search engines cannot read them.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const entries = new Map<string, { locales: Locale[]; updatedAt?: string }>()
  const add = (href: string, locale: Locale, updatedAt?: string) => {
    const entry = entries.get(href) ?? { locales: [], updatedAt }
    entry.locales.push(locale)
    if (updatedAt && (!entry.updatedAt || updatedAt > entry.updatedAt)) entry.updatedAt = updatedAt
    entries.set(href, entry)
  }
  const common = { depth: 0, pagination: false, overrideAccess: true } as const

  // Categories and instructors have no drafts, so they exist in every language
  const [categories, instructors] = await Promise.all([
    payload.find({ collection: 'categories', select: { slug: true, updatedAt: true }, ...common }),
    payload.find({ collection: 'instructors', select: { slug: true, updatedAt: true }, ...common }),
  ])

  for (const locale of locales) {
    add(cataloguePath, locale)
    for (const doc of categories.docs) add(categoryPath(doc.slug), locale, doc.updatedAt)
    for (const doc of instructors.docs) add(instructorPath(doc.slug), locale, doc.updatedAt)

    const [pages, courses] = await Promise.all([
      payload.find({
        collection: 'pages',
        locale,
        where: published,
        select: { slug: true, updatedAt: true },
        ...common,
      }),
      payload.find({
        collection: 'courses',
        locale,
        where: published,
        select: { slug: true, updatedAt: true },
        ...common,
      }),
    ])
    for (const doc of pages.docs) add(pageHref(doc.slug), locale, doc.updatedAt)
    for (const doc of courses.docs) add(coursePath(doc.slug), locale, doc.updatedAt)

    const courseSlugs = new Map(courses.docs.map((course) => [course.id, course.slug]))
    const lessons = courseSlugs.size
      ? await payload.find({
          collection: 'lessons',
          locale,
          where: {
            ...published,
            freePreview: { equals: true },
            course: { in: [...courseSlugs.keys()] },
          },
          select: { slug: true, course: true, updatedAt: true },
          ...common,
        })
      : { docs: [] }
    for (const doc of lessons.docs) {
      const courseSlug = courseSlugs.get(doc.course as string)
      if (courseSlug) add(lessonPath(courseSlug, doc.slug), locale, doc.updatedAt)
    }
  }

  return [...entries].flatMap(([href, { locales: hrefLocales, updatedAt }]) =>
    hrefLocales.map((locale) => ({
      url: absoluteUrl(href, locale),
      lastModified: updatedAt,
      alternates: {
        languages: alternatesFor(href, locale, hrefLocales).languages as Record<string, string>,
      },
    })),
  )
}
