import { defaultLocale, type Locale } from '@/i18n/routing'

export const HOME_SLUG = 'home'

// Locale-less hrefs for next-intl's <Link>, which adds the locale prefix
export const pageHref = (slug: string) => (slug === HOME_SLUG ? '/' : `/${slug}`)
export const coursePath = (slug: string) => `/courses/${slug}`
export const lessonPath = (courseSlug: string, lessonSlug: string) =>
  `/courses/${courseSlug}/${lessonSlug}`

// Path of a page for a given locale, following the `as-needed` prefix strategy
export function pagePath(slug: string, locale: Locale): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`
  const path = slug === HOME_SLUG ? '' : `/${slug}`
  return `${prefix}${path}` || '/'
}
