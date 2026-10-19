import type { Metadata } from 'next'

import { env } from '@/env'
import { defaultLocale, type Locale } from '@/i18n/routing'

import { localizedHref } from './paths'

// Absolute URL of a locale-less href in a locale
export function absoluteUrl(href: string, locale: Locale): string {
  return new URL(localizedHref(href, locale), env.NEXT_PUBLIC_SITE_URL).toString()
}

// Canonical URL plus hreflang alternates, limited to the locales where the document is published
export function alternatesFor(
  href: string,
  locale: Locale,
  publishedLocales: readonly Locale[],
): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = Object.fromEntries(
    publishedLocales.map((l) => [l, absoluteUrl(href, l)]),
  )
  if (publishedLocales.includes(defaultLocale)) {
    languages['x-default'] = absoluteUrl(href, defaultLocale)
  }
  return { canonical: absoluteUrl(href, locale), languages }
}

// Structured data for search engines; `<` is escaped so content can never close the script tag
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c')
}
