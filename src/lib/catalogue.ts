import { type CourseLevel, courseLevelValues, lessonIdsOf, relationId } from './courses'

// Catalogue sorting and filtering, and syllabus assembly. Pure, so the pages, the sitemap and the
// tests agree. Counts and durations only include lessons published in the requested locale.

export const catalogueSorts = ['newest', 'popular', 'duration', 'title'] as const
export type CatalogueSort = (typeof catalogueSorts)[number]

// < 1 h, 1–3 h, > 3 h
export const durationBuckets = ['short', 'medium', 'long'] as const
export type DurationBucket = (typeof durationBuckets)[number]

export function durationBucketOf(minutes: number): DurationBucket {
  if (minutes < 60) return 'short'
  return minutes <= 180 ? 'medium' : 'long'
}

export type CatalogueQuery = {
  sort: CatalogueSort
  category?: string
  level?: CourseLevel
  duration?: DurationBucket
}

const pick = <T extends string>(options: readonly T[], value: unknown): T | undefined =>
  typeof value === 'string' && (options as readonly string[]).includes(value)
    ? (value as T)
    : undefined

// Unknown values are ignored rather than rejected: old or hand-edited links still work
export function parseCatalogueQuery(
  params: Record<string, string | string[] | undefined>,
  categorySlugs: string[],
): CatalogueQuery {
  return {
    sort: pick(catalogueSorts, params.sort) ?? 'newest',
    category: pick(categorySlugs, params.category),
    level: pick(courseLevelValues, params.level),
    duration: pick(durationBuckets, params.duration),
  }
}

export type SyllabusLesson = { id: string; course?: unknown; readingTime?: number | null }

export type SyllabusModule<L extends SyllabusLesson = SyllabusLesson> = {
  id: string
  title: string
  lessons: L[]
}

// The course's modules, keeping only lessons that are reachable (published in the locale, or
// drafts while staff preview) and whose `course` is this course. Empty modules are dropped.
export function buildSyllabus<L extends SyllabusLesson>(
  courseId: string,
  modules: { id?: string | null; title: string; lessons?: unknown[] | null }[] | null | undefined,
  lessons: L[],
): SyllabusModule<L>[] {
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]))
  return (modules ?? []).flatMap((module, index) => {
    const found = lessonIdsOf([module as { lessons?: string[] }]).flatMap((id) => {
      const lesson = byId.get(id)
      return lesson && relationId(lesson.course as string | null) === courseId ? [lesson] : []
    })
    return found.length
      ? [{ id: module.id ?? String(index), title: module.title, lessons: found }]
      : []
  })
}

export const syllabusLessons = <L extends SyllabusLesson>(syllabus: SyllabusModule<L>[]) =>
  syllabus.flatMap((module) => module.lessons)

export function courseStats(syllabus: SyllabusModule[]) {
  const lessons = syllabusLessons(syllabus)
  return {
    lessonCount: lessons.length,
    minutes: lessons.reduce((total, lesson) => total + (lesson.readingTime ?? 0), 0),
  }
}

// A lesson is new when it arrived after its course came out, within the last month: a course
// that has just launched does not mark every lesson as new.
export const NEW_LESSON_DAYS = 30
const DAY = 24 * 60 * 60 * 1000

export function isNewLesson(
  lessonPublishedAt: string | null | undefined,
  coursePublishedAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!lessonPublishedAt || !coursePublishedAt) return false
  const lesson = Date.parse(lessonPublishedAt)
  return lesson - Date.parse(coursePublishedAt) > DAY && now - lesson < NEW_LESSON_DAYS * DAY
}

export type CatalogueCourse = {
  title: string
  categorySlug?: string | null
  level: CourseLevel
  featured?: boolean | null
  enrollmentCount?: number | null
  firstPublishedAt?: string | null
  minutes: number
}

export function applyCatalogueQuery<C extends CatalogueCourse>(
  courses: C[],
  query: CatalogueQuery,
  locale: string,
): C[] {
  const filtered = courses.filter(
    (course) =>
      (!query.category || course.categorySlug === query.category) &&
      (!query.level || course.level === query.level) &&
      (!query.duration || durationBucketOf(course.minutes) === query.duration),
  )
  const collator = new Intl.Collator(locale)
  const byTitle = (a: C, b: C) => collator.compare(a.title, b.title)
  const published = (course: C) =>
    course.firstPublishedAt ? Date.parse(course.firstPublishedAt) : 0
  const compare: Record<CatalogueSort, (a: C, b: C) => number> = {
    // Featured courses lead the default order only
    newest: (a, b) =>
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || published(b) - published(a),
    popular: (a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0),
    duration: (a, b) => a.minutes - b.minutes,
    title: byTitle,
  }
  return [...filtered].sort((a, b) => compare[query.sort](a, b) || byTitle(a, b))
}
