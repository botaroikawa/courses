import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { RichText } from '@/components/rich-text'
import { LivePreviewListener } from '@/components/site/live-preview-listener'
import { routing } from '@/i18n/routing'
import { getPage, getPublishedLocales, mediaOf } from '@/lib/content'
import { HOME_SLUG } from '@/lib/paths'
import { alternatesFor } from '@/lib/seo'

type Props = {
  params: Promise<{ locale: string; slug?: string[] }>
}

async function resolve(params: Props['params']) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const pageSlug = slug?.join('/') || HOME_SLUG
  // The home page is only reachable at the root, never at /home
  if (slug?.length === 1 && slug[0] === HOME_SLUG) notFound()
  return { locale, pageSlug }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pageSlug } = await resolve(params)
  const [page, publishedLocales] = await Promise.all([
    getPage(pageSlug, locale),
    getPublishedLocales(pageSlug),
  ])
  if (!page) return {}
  const image = mediaOf(page.meta?.image)
  return {
    title: pageSlug === HOME_SLUG ? undefined : page.meta?.title || page.title,
    description: page.meta?.description ?? undefined,
    alternates: alternatesFor(pageSlug, locale, publishedLocales),
    openGraph: image?.url
      ? { images: [{ url: image.url, alt: image.alt ?? undefined }] }
      : undefined,
  }
}

export default async function PayloadPage({ params }: Props) {
  const { locale, pageSlug } = await resolve(params)
  setRequestLocale(locale)

  const [page, { isEnabled: isDraft }] = await Promise.all([getPage(pageSlug, locale), draftMode()])
  if (!page) notFound()

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      {isDraft && <LivePreviewListener />}
      <h1 className="font-semibold text-4xl tracking-tight">{page.title}</h1>
      <RichText data={page.content} />
    </article>
  )
}
