import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'es', 'ca'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English lives at the root, the rest under /es and /ca
  localePrefix: 'as-needed',
})

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}
