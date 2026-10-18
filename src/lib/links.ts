import type { Header } from '@/payload-types'

import { HOME_SLUG } from './paths'

export type NavItem = NonNullable<Header['navItems']>[number]

export type ResolvedLink =
  | { kind: 'internal'; href: string; newTab: boolean }
  | { kind: 'external'; href: string; newTab: boolean }

// Internal hrefs are locale-less: next-intl's <Link> adds the prefix
export function resolveLink(link: NavItem['link']): ResolvedLink | null {
  if (!link) return null
  const newTab = Boolean(link.newTab)
  if (link.type === 'external')
    return link.url ? { kind: 'external', href: link.url, newTab } : null
  const page = link.page
  if (!page || typeof page !== 'object') return null
  return { kind: 'internal', href: page.slug === HOME_SLUG ? '/' : `/${page.slug}`, newTab }
}
