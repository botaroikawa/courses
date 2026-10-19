import { describe, expect, it } from 'vitest'

import {
  applyCatalogueQuery,
  buildSyllabus,
  courseStats,
  durationBucketOf,
  isNewLesson,
  parseCatalogueQuery,
} from '@/lib/catalogue'
import { localizedHref } from '@/lib/paths'

describe('parseCatalogueQuery', () => {
  it('keeps known values and drops the rest', () => {
    expect(
      parseCatalogueQuery(
        { sort: 'popular', category: 'design', level: 'advanced', duration: 'long' },
        ['design'],
      ),
    ).toEqual({ sort: 'popular', category: 'design', level: 'advanced', duration: 'long' })
    expect(
      parseCatalogueQuery({ sort: 'random', category: 'gone', level: ['beginner'] }, ['design']),
    ).toEqual({
      sort: 'newest',
      category: undefined,
      level: undefined,
      duration: undefined,
    })
  })
})

describe('durationBucketOf', () => {
  it('splits at one and three hours', () => {
    expect([59, 60, 180, 181].map(durationBucketOf)).toEqual(['short', 'medium', 'medium', 'long'])
  })
})

describe('buildSyllabus', () => {
  const lesson = (id: string, course = 'c1', readingTime = 5) => ({ id, course, readingTime })

  it('keeps syllabus order, drops unreachable lessons and empty modules', () => {
    const syllabus = buildSyllabus(
      'c1',
      [
        { id: 'm1', title: 'One', lessons: ['b', { id: 'a' }, 'missing'] },
        { id: 'm2', title: 'Two', lessons: ['other-course'] },
        { id: 'm3', title: 'Three', lessons: ['c'] },
      ],
      [lesson('a'), lesson('b'), lesson('c', 'c1', 12), lesson('other-course', 'c2')],
    )
    expect(syllabus.map((module) => [module.id, module.lessons.map((l) => l.id)])).toEqual([
      ['m1', ['b', 'a']],
      ['m3', ['c']],
    ])
    expect(courseStats(syllabus)).toEqual({ lessonCount: 3, minutes: 22 })
  })
})

describe('isNewLesson', () => {
  const now = Date.parse('2026-10-19T00:00:00Z')

  it('marks lessons added after the course came out, for a month', () => {
    expect(isNewLesson('2026-10-10T00:00:00Z', '2026-09-01T00:00:00Z', now)).toBe(true)
    expect(isNewLesson('2026-09-01T00:00:00Z', '2026-08-01T00:00:00Z', now)).toBe(false)
    // Published with the course
    expect(isNewLesson('2026-10-10T00:00:00Z', '2026-10-10T00:00:00Z', now)).toBe(false)
    expect(isNewLesson(null, '2026-09-01T00:00:00Z', now)).toBe(false)
  })
})

describe('applyCatalogueQuery', () => {
  const course = (title: string, extra: object) => ({
    title,
    level: 'beginner' as const,
    minutes: 30,
    firstPublishedAt: '2026-01-01T00:00:00Z',
    ...extra,
  })
  const courses = [
    course('Árboles', {
      minutes: 200,
      enrollmentCount: 5,
      firstPublishedAt: '2026-03-01T00:00:00Z',
    }),
    course('Bases', { featured: true, enrollmentCount: 1, categorySlug: 'data' }),
    course('Zeta', {
      level: 'advanced',
      minutes: 90,
      enrollmentCount: 9,
      firstPublishedAt: '2026-05-01T00:00:00Z',
    }),
  ]
  const titles = (list: { title: string }[]) => list.map((c) => c.title)

  it('sorts newest first with featured courses leading', () => {
    expect(titles(applyCatalogueQuery(courses, { sort: 'newest' }, 'es'))).toEqual([
      'Bases',
      'Zeta',
      'Árboles',
    ])
  })

  it('sorts by popularity, duration and title in the locale', () => {
    expect(titles(applyCatalogueQuery(courses, { sort: 'popular' }, 'es'))).toEqual([
      'Zeta',
      'Árboles',
      'Bases',
    ])
    expect(titles(applyCatalogueQuery(courses, { sort: 'duration' }, 'es'))).toEqual([
      'Bases',
      'Zeta',
      'Árboles',
    ])
    expect(titles(applyCatalogueQuery(courses, { sort: 'title' }, 'es'))).toEqual([
      'Árboles',
      'Bases',
      'Zeta',
    ])
  })

  it('filters by category, level and duration', () => {
    expect(titles(applyCatalogueQuery(courses, { sort: 'title', category: 'data' }, 'es'))).toEqual(
      ['Bases'],
    )
    expect(
      titles(applyCatalogueQuery(courses, { sort: 'title', level: 'advanced' }, 'es')),
    ).toEqual(['Zeta'])
    expect(titles(applyCatalogueQuery(courses, { sort: 'title', duration: 'long' }, 'es'))).toEqual(
      ['Árboles'],
    )
  })
})

describe('localizedHref', () => {
  it('prefixes every locale but the default', () => {
    expect(localizedHref('/courses/a', 'en')).toBe('/courses/a')
    expect(localizedHref('/courses/a', 'es')).toBe('/es/courses/a')
    expect(localizedHref('/', 'ca')).toBe('/ca')
  })
})
