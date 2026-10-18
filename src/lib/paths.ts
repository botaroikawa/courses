import { defaultLocale, type Locale } from '@/i18n/routing'

export const HOME_SLUG = 'home'

// Path of a page for a given locale, following the `as-needed` prefix strategy
export function pagePath(slug: string, locale: Locale): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`
  const path = slug === HOME_SLUG ? '' : `/${slug}`
  return `${prefix}${path}` || '/'
}
