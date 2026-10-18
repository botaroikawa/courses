import { describe, expect, it } from 'vitest'

import { resolveLink } from '@/lib/links'
import { HOME_SLUG, pagePath } from '@/lib/paths'
import { safeRedirect } from '@/lib/redirects'
import type { Page } from '@/payload-types'

describe('pagePath', () => {
  it('serves the default locale without prefix', () => {
    expect(pagePath('about', 'en')).toBe('/about')
    expect(pagePath(HOME_SLUG, 'en')).toBe('/')
  })

  it('prefixes other locales', () => {
    expect(pagePath('about', 'es')).toBe('/es/about')
    expect(pagePath(HOME_SLUG, 'ca')).toBe('/ca')
  })
})

describe('safeRedirect', () => {
  it('accepts same-site paths', () => {
    expect(safeRedirect('/es/account')).toBe('/es/account')
  })

  it('rejects anything that could leave the site', () => {
    expect(safeRedirect('//evil.com')).toBe('/account')
    expect(safeRedirect('https://evil.com')).toBe('/account')
    expect(safeRedirect(undefined)).toBe('/account')
  })
})

describe('resolveLink', () => {
  const page = { slug: 'about' } as Page

  it('builds locale-less hrefs for internal pages', () => {
    expect(resolveLink({ type: 'internal', page })).toEqual({
      kind: 'internal',
      href: '/about',
      newTab: false,
    })
    expect(resolveLink({ type: 'internal', page: { slug: HOME_SLUG } as Page })?.href).toBe('/')
  })

  it('drops internal links whose page is not readable', () => {
    // Unpublished pages come back as a bare id when populated by an anonymous visitor
    expect(resolveLink({ type: 'internal', page: 'some-id' })).toBeNull()
  })

  it('passes external URLs through', () => {
    expect(resolveLink({ type: 'external', url: 'https://example.com', newTab: true })).toEqual({
      kind: 'external',
      href: 'https://example.com',
      newTab: true,
    })
  })
})
