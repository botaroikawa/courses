import type { Metadata } from 'next'

import { env } from '@/env'
import { defaultLocale, type Locale } from '@/i18n/routing'

import { pagePath } from './paths'

export function absoluteUrl(slug: string, locale: Locale): string {
  return new URL(pagePath(slug, locale), env.NEXT_PUBLIC_SITE_URL).toString()
}

// Canonical URL plus hreflang alternates, limited to the locales where the page is published
export function alternatesFor(
  slug: string,
  locale: Locale,
  publishedLocales: Locale[],
): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = Object.fromEntries(
    publishedLocales.map((l) => [l, absoluteUrl(slug, l)]),
  )
  if (publishedLocales.includes(defaultLocale)) {
    languages['x-default'] = absoluteUrl(slug, defaultLocale)
  }
  return { canonical: absoluteUrl(slug, locale), languages }
}
