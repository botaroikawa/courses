import { coursePath, lessonPath, pageHref } from './paths'

// Internal links point at documents, never at URLs, so a slug change never breaks them. Hrefs are
// resolved when rendering (getLinkHrefs in src/lib/content.ts), and a target that is not
// published in the visitor's language renders as plain text.
export const linkableCollections = ['pages', 'courses', 'lessons'] as const
export type LinkableCollection = (typeof linkableCollections)[number]

export type LinkRef = { relationTo: LinkableCollection; id: string }
// Href of each reachable target, keyed by refKey
export type LinkHrefs = ReadonlyMap<string, string>

export const refKey = ({ relationTo, id }: LinkRef) => `${relationTo}:${id}`

// The shared link field and Lexical's own links both store `{ relationTo, value }`
function refOf(value: unknown): LinkRef | null {
  if (!value || typeof value !== 'object') return null
  const { relationTo, value: target } = value as { relationTo?: unknown; value?: unknown }
  if (!linkableCollections.includes(relationTo as LinkableCollection)) return null
  const id =
    typeof target === 'string' ? target : (target as { id?: unknown } | null | undefined)?.id
  return typeof id === 'string' ? { relationTo: relationTo as LinkableCollection, id } : null
}

// Every internal link target inside a value: rich text, a global, a block
export function linkRefsIn(value: unknown): LinkRef[] {
  const found = new Map<string, LinkRef>()
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const ref = refOf(node)
    if (ref) found.set(refKey(ref), ref)
    for (const child of Object.values(node)) visit(child)
  }
  visit(value)
  return [...found.values()]
}

export function hrefsFor({
  pages,
  courses,
  lessons,
}: {
  pages: { id: string; slug?: string | null }[]
  courses: { id: string; slug?: string | null }[]
  lessons: { id: string; slug?: string | null; course?: unknown }[]
}): LinkHrefs {
  const hrefs = new Map<string, string>()
  const courseSlugs = new Map(courses.map((course) => [course.id, course.slug]))
  for (const page of pages) {
    if (page.slug) hrefs.set(refKey({ relationTo: 'pages', id: page.id }), pageHref(page.slug))
  }
  for (const course of courses) {
    if (course.slug) {
      hrefs.set(refKey({ relationTo: 'courses', id: course.id }), coursePath(course.slug))
    }
  }
  for (const lesson of lessons) {
    const courseId =
      typeof lesson.course === 'string' ? lesson.course : (lesson.course as { id?: string })?.id
    const courseSlug = courseId ? courseSlugs.get(courseId) : null
    if (lesson.slug && courseSlug) {
      hrefs.set(
        refKey({ relationTo: 'lessons', id: lesson.id }),
        lessonPath(courseSlug, lesson.slug),
      )
    }
  }
  return hrefs
}

export type LinkValue = {
  type?: 'internal' | 'external' | null
  doc?: unknown
  url?: string | null
  newTab?: boolean | null
}

export type ResolvedLink = { kind: 'internal' | 'external'; href: string; newTab: boolean }

export function resolveLink(
  link: LinkValue | null | undefined,
  hrefs: LinkHrefs,
): ResolvedLink | null {
  if (!link) return null
  const newTab = Boolean(link.newTab)
  if (link.type === 'external') {
    if (!link.url) return null
    // A site path gets the locale prefix like any internal link
    const sitePath = link.url.startsWith('/') && !link.url.startsWith('//')
    return { kind: sitePath ? 'internal' : 'external', href: link.url, newTab }
  }
  const ref = refOf(link.doc)
  const href = ref && hrefs.get(refKey(ref))
  return href ? { kind: 'internal', href, newTab } : null
}
