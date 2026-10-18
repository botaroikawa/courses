import 'server-only'

import config from '@payload-config'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import { type Locale, locales } from '@/i18n/routing'
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

export function mediaOf(value: string | Media | null | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}
