import type { PayloadRequest } from 'payload'

import { isLocale } from '@/i18n/routing'

import { relationId } from './courses'
import { coursePath, lessonPath, localizedHref, pageHref } from './paths'

// Admin preview and live preview open /api/preview, which turns on draft mode for staff and
// redirects to the document's page in the edited locale
const previewUrl = (href: string | null, locale: string) =>
  href && isLocale(locale)
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/preview?path=${encodeURIComponent(localizedHref(href, locale))}`
    : null

type Doc = Record<string, unknown>

export const pagePreview = (doc: Doc, locale: string) =>
  previewUrl(typeof doc.slug === 'string' ? pageHref(doc.slug) : null, locale)

export const coursePreview = (doc: Doc, locale: string) =>
  previewUrl(typeof doc.slug === 'string' ? coursePath(doc.slug) : null, locale)

// A lesson's URL needs its course's slug; a lesson outside every course has no page
export async function lessonPreview(doc: Doc, locale: string, req: PayloadRequest) {
  const courseId = relationId(doc.course as string | { id: string } | null)
  if (typeof doc.slug !== 'string' || !courseId) return null
  const course = await req.payload.findByID({
    collection: 'courses',
    id: courseId,
    select: { slug: true },
    draft: true,
    depth: 0,
    disableErrors: true,
    overrideAccess: true,
    req,
  })
  return previewUrl(course?.slug ? lessonPath(course.slug, doc.slug) : null, locale)
}
