import { describe, expect, it } from 'vitest'

import { hrefsFor, linkRefsIn, resolveLink } from '@/lib/links'
import { HOME_SLUG, pagePath } from '@/lib/paths'
import { safeRedirect } from '@/lib/redirects'

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

describe('internal links', () => {
  const hrefs = hrefsFor({
    pages: [
      { id: 'p1', slug: 'about' },
      { id: 'p2', slug: HOME_SLUG },
    ],
    courses: [{ id: 'c1', slug: 'design' }],
    lessons: [
      { id: 'l1', slug: 'colour', course: 'c1' },
      // Its course is not reachable in this locale
      { id: 'l2', slug: 'type', course: 'c9' },
    ],
  })
  const to = (relationTo: string, value: unknown) => ({
    type: 'internal' as const,
    doc: { relationTo, value },
  })

  it('builds locale-less hrefs for pages, courses and lessons', () => {
    expect(resolveLink(to('pages', 'p1'), hrefs)).toEqual({
      kind: 'internal',
      href: '/about',
      newTab: false,
    })
    expect(resolveLink(to('pages', 'p2'), hrefs)?.href).toBe('/')
    expect(resolveLink(to('courses', 'c1'), hrefs)?.href).toBe('/courses/design')
    expect(resolveLink(to('lessons', { id: 'l1' }), hrefs)?.href).toBe('/courses/design/colour')
  })

  it('drops targets that are not reachable', () => {
    expect(resolveLink(to('lessons', 'l2'), hrefs)).toBeNull()
    expect(resolveLink(to('pages', 'unpublished'), hrefs)).toBeNull()
  })

  it('passes external URLs through', () => {
    expect(
      resolveLink({ type: 'external', url: 'https://example.com', newTab: true }, hrefs),
    ).toEqual({ kind: 'external', href: 'https://example.com', newTab: true })
    expect(resolveLink({ type: 'external', url: '/courses' }, hrefs)?.kind).toBe('internal')
    expect(resolveLink({ type: 'external', url: '//evil.com' }, hrefs)?.kind).toBe('external')
  })

  it('finds every target in a value, once', () => {
    const content = {
      root: {
        children: [
          {
            type: 'link',
            fields: { linkType: 'internal', doc: { relationTo: 'pages', value: 'p1' } },
          },
          {
            type: 'block',
            fields: {
              blockType: 'link',
              link: { doc: { relationTo: 'lessons', value: { id: 'l1' } } },
            },
          },
          { type: 'upload', relationTo: 'media', value: 'm1' },
          { type: 'link', fields: { doc: { relationTo: 'pages', value: 'p1' } } },
        ],
      },
    }
    expect(linkRefsIn(content)).toEqual([
      { relationTo: 'pages', id: 'p1' },
      { relationTo: 'lessons', id: 'l1' },
    ])
  })
})
