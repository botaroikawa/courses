import 'server-only'

import config from '@payload-config'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import { type Locale, locales } from '@/i18n/routing'
import { hrefsFor, type LinkHrefs, type LinkRef } from '@/lib/links'
import type { Brand, Footer, Header, Media, Page } from '@/payload-types'

export const getPayloadClient = cache(() => getPayload({ config }))

// In draft mode the signed-in admin's permissions apply, so drafts become visible
const getViewer = cache(async () => {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return { draft: false, user: null }
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return { draft: Boolean(user), user }
})

export const getPage = cache(async (slug: string, locale: Locale): Promise<Page | null> => {
  const payload = await getPayloadClient()
  const { draft, user } = await getViewer()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    draft,
    user,
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

// Locales in which a page is published, used for hreflang alternates and the sitemap
export const getPublishedLocales = cache(async (slug: string): Promise<Locale[]> => {
  const payload = await getPayloadClient()
  const published = await Promise.all(
    locales.map(async (locale) => {
      const { totalDocs } = await payload.count({
        collection: 'pages',
        locale,
        where: { slug: { equals: slug }, _status: { equals: 'published' } },
      })
      return totalDocs > 0 ? locale : null
    }),
  )
  return published.filter((locale) => locale !== null)
})

export const getSiteGlobals = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const [header, footer, brand] = await Promise.all([
    payload.findGlobal({ slug: 'header', locale, depth: 1 }),
    payload.findGlobal({ slug: 'footer', locale, depth: 1 }),
    payload.findGlobal({ slug: 'brand', locale, depth: 1 }),
  ])
  return { header, footer, brand } satisfies { header: Header; footer: Footer; brand: Brand }
})

// Hrefs for internal links. Read with overrideAccess because the targets' slugs are public even
// where their content is not (a lesson behind sign-in), and limited to what is published in
// `locale`, or to drafts too while staff preview.
export async function getLinkHrefs(refs: LinkRef[], locale: Locale): Promise<LinkHrefs> {
  if (!refs.length) return new Map()
  const payload = await getPayloadClient()
  const { draft } = await getViewer()
  const idsOf = (collection: LinkRef['relationTo']) =>
    refs.filter((ref) => ref.relationTo === collection).map((ref) => ref.id)
  const query = (ids: string[]) => ({
    where: {
      id: { in: ids },
      ...(draft ? {} : { _status: { equals: 'published' as const } }),
    },
    locale,
    draft,
    depth: 0,
    pagination: false as const,
    overrideAccess: true,
  })

  const [pages, lessons] = await Promise.all([
    idsOf('pages').length
      ? payload.find({ collection: 'pages', select: { slug: true }, ...query(idsOf('pages')) })
      : null,
    idsOf('lessons').length
      ? payload.find({
          collection: 'lessons',
          select: { slug: true, course: true },
          ...query(idsOf('lessons')),
        })
      : null,
  ])
  // A lesson's href needs its course's slug, and its course must be reachable too
  const courseIds = [
    ...new Set([
      ...idsOf('courses'),
      ...(lessons?.docs ?? []).flatMap((lesson) => (lesson.course ? [String(lesson.course)] : [])),
    ]),
  ]
  const courses = courseIds.length
    ? await payload.find({ collection: 'courses', select: { slug: true }, ...query(courseIds) })
    : null
  return hrefsFor({
    pages: pages?.docs ?? [],
    courses: courses?.docs ?? [],
    lessons: lessons?.docs ?? [],
  })
}

// Media documents by id, with the viewer's access: private files stay out for visitors
export async function getMediaByIds(ids: string[]): Promise<Media[]> {
  if (!ids.length) return []
  const payload = await getPayloadClient()
  const { user } = await getViewer()
  const { docs } = await payload.find({
    collection: 'media',
    where: { id: { in: ids } },
    depth: 0,
    pagination: false,
    user,
  })
  return docs
}

export function mediaOf(value: string | Media | null | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}
