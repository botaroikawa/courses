import 'server-only'

import type { Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/routing'
import type { Category, Course, Instructor, Lesson, Media } from '@/payload-types'

import {
  buildSyllabus,
  type CatalogueCourse,
  courseStats,
  type SyllabusModule,
  syllabusLessons,
} from './catalogue'
import { getPayloadClient, getViewer, mediaOf } from './content'
import { lessonIdsOf } from './courses'
import { getSession } from './session'

// What the public site reads about courses and lessons. Visitors see what is published in their
// language; staff previewing with draft mode see drafts. See docs/content-model.md.

const reachable = async () => {
  const { draft, user } = await getViewer()
  const published: Where = draft ? {} : { _status: { equals: 'published' } }
  return { draft, user, published }
}

const lessonSelect = {
  title: true,
  slug: true,
  summary: true,
  freePreview: true,
  readingTime: true,
  firstPublishedAt: true,
  course: true,
  meta: true,
} as const

export type SyllabusEntry = Pick<
  Lesson,
  | 'id'
  | 'title'
  | 'slug'
  | 'summary'
  | 'freePreview'
  | 'readingTime'
  | 'firstPublishedAt'
  | 'course'
  | 'meta'
>

// Lessons are read with overrideAccess: their titles and order are public, while the API only
// hands out free previews. Content is fetched separately, after canReadLesson.
async function findSyllabusLessons(ids: string[], locale: Locale): Promise<SyllabusEntry[]> {
  if (!ids.length) return []
  const payload = await getPayloadClient()
  const { draft, published } = await reachable()
  const { docs } = await payload.find({
    collection: 'lessons',
    where: { id: { in: ids }, ...published },
    select: lessonSelect,
    locale,
    draft,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  return docs as SyllabusEntry[]
}

export type CatalogueEntry = CatalogueCourse & {
  id: string
  slug: string
  summary: string
  cover: Media | null
  category: Pick<Category, 'name' | 'slug'> | null
  instructorIds: string[]
  lessonCount: number
}

export const getCatalogue = cache(async (locale: Locale): Promise<CatalogueEntry[]> => {
  const payload = await getPayloadClient()
  const { draft, user, published } = await reachable()
  // Courses go through their own access, so a private cover stays out for visitors
  const { docs: courses } = await payload.find({
    collection: 'courses',
    where: published,
    select: {
      title: true,
      slug: true,
      summary: true,
      cover: true,
      level: true,
      category: true,
      instructors: true,
      featured: true,
      enrollmentCount: true,
      firstPublishedAt: true,
      // Nested on purpose: `{ modules: true }` returns empty `lessons` in Payload 4.0.0-beta.2
      modules: { title: true, lessons: true },
    },
    populate: { categories: { name: true, slug: true } },
    locale,
    draft,
    user,
    depth: 1,
    pagination: false,
  })

  const { docs: lessons } = courses.length
    ? await payload.find({
        collection: 'lessons',
        where: { course: { in: courses.map((course) => course.id) }, ...published },
        select: { course: true, readingTime: true },
        locale,
        draft,
        depth: 0,
        pagination: false,
        overrideAccess: true,
      })
    : { docs: [] }

  return courses.map((course) => {
    const category = course.category && typeof course.category === 'object' ? course.category : null
    const stats = courseStats(buildSyllabus(course.id, course.modules, lessons))
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      cover: mediaOf(course.cover),
      level: course.level,
      category,
      categorySlug: category?.slug,
      instructorIds: (course.instructors ?? []).map((instructor) =>
        typeof instructor === 'object' ? instructor.id : instructor,
      ),
      featured: course.featured,
      enrollmentCount: course.enrollmentCount,
      firstPublishedAt: course.firstPublishedAt,
      ...stats,
    }
  })
})

export type CourseDetail = {
  course: Course
  category: Category | null
  instructors: Instructor[]
  syllabus: SyllabusModule<SyllabusEntry>[]
  lessonCount: number
  minutes: number
}

export const getCourse = cache(
  async (slug: string, locale: Locale): Promise<CourseDetail | null> => {
    const payload = await getPayloadClient()
    const { draft, user, published } = await reachable()
    const { docs } = await payload.find({
      collection: 'courses',
      where: { slug: { equals: slug }, ...published },
      // Instructors need their photo: two levels
      depth: 2,
      // Syllabus lessons are read separately (findSyllabusLessons)
      populate: { lessons: { slug: true } },
      locale,
      draft,
      user,
      limit: 1,
    })
    const course = docs[0]
    if (!course) return null

    const lessons = await findSyllabusLessons(lessonIdsOf(course.modules), locale)
    const syllabus = buildSyllabus(course.id, course.modules, lessons)
    return {
      course,
      category: course.category && typeof course.category === 'object' ? course.category : null,
      instructors: (course.instructors ?? []).filter(
        (instructor): instructor is Instructor => typeof instructor === 'object',
      ),
      syllabus,
      ...courseStats(syllabus),
    }
  },
)

export type LessonDetail = CourseDetail & {
  lesson: SyllabusEntry
  position: number
  previous: SyllabusEntry | null
  next: SyllabusEntry | null
}

// A lesson is reachable only through its course's syllabus
export const getLesson = cache(
  async (courseSlug: string, lessonSlug: string, locale: Locale): Promise<LessonDetail | null> => {
    const detail = await getCourse(courseSlug, locale)
    if (!detail) return null
    const lessons = syllabusLessons(detail.syllabus)
    const position = lessons.findIndex((lesson) => lesson.slug === lessonSlug)
    const lesson = lessons[position]
    if (!lesson) return null
    return {
      ...detail,
      lesson,
      position,
      previous: lessons[position - 1] ?? null,
      next: lessons[position + 1] ?? null,
    }
  },
)

// The one place that decides who reads a lesson (docs/product.md). Paid access will join here.
export async function canReadLesson(lesson: Pick<Lesson, 'freePreview'>): Promise<boolean> {
  if (lesson.freePreview) return true
  const { draft } = await getViewer()
  if (draft) return true
  return Boolean(await getSession())
}

// Call only after canReadLesson
export async function getLessonContent(id: string, locale: Locale): Promise<Lesson['content']> {
  const payload = await getPayloadClient()
  const { draft } = await reachable()
  const lesson = await payload.findByID({
    collection: 'lessons',
    id,
    select: { content: true },
    locale,
    draft,
    depth: 1,
    overrideAccess: true,
  })
  return lesson.content
}

export const getCategories = cache(async (locale: Locale): Promise<Category[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    locale,
    sort: '_order',
    depth: 0,
    pagination: false,
  })
  return docs
})

export const getInstructor = cache(
  async (slug: string, locale: Locale): Promise<Instructor | null> => {
    const payload = await getPayloadClient()
    const { user } = await getViewer()
    const { docs } = await payload.find({
      collection: 'instructors',
      where: { slug: { equals: slug } },
      locale,
      user,
      depth: 1,
      limit: 1,
    })
    return docs[0] ?? null
  },
)
