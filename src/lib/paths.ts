import { defaultLocale, type Locale } from '@/i18n/routing'

export const HOME_SLUG = 'home'

// Locale-less hrefs for next-intl's <Link>, which adds the locale prefix
export const pageHref = (slug: string) => (slug === HOME_SLUG ? '/' : `/${slug}`)
export const cataloguePath = '/courses'
export const coursePath = (slug: string) => `${cataloguePath}/${slug}`
export const lessonPath = (courseSlug: string, lessonSlug: string) =>
  `${coursePath(courseSlug)}/${lessonSlug}`
export const categoryPath = (slug: string) => `/categories/${slug}`
export const instructorPath = (slug: string) => `/instructors/${slug}`

// First path segments the app owns: a page slug cannot take them
export const reservedSlugs = [
  'courses',
  'categories',
  'instructors',
  'account',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'verify-email',
  'admin',
  'api',
]

// A locale-less href in a given locale, following the `as-needed` prefix strategy
export function localizedHref(href: string, locale: Locale): string {
  if (locale === defaultLocale) return href
  return href === '/' ? `/${locale}` : `/${locale}${href}`
}

export const pagePath = (slug: string, locale: Locale) => localizedHref(pageHref(slug), locale)
