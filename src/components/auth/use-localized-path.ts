'use client'

import { useLocale } from 'next-intl'
import { useCallback } from 'react'

import { getPathname } from '@/i18n/navigation'

// Better Auth callback URLs must include the locale prefix (e.g. /es/account)
export function useLocalizedPath() {
  const locale = useLocale()
  return useCallback((href: string) => getPathname({ href, locale }), [locale])
}
