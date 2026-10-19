// `sql` from the adapter, not `drizzle-orm`: the app's own drizzle-orm is a different version
import { type PostgresAdapter, sql } from '@payloadcms/db-postgres'
import type { PayloadRequest } from 'payload'

import { duplicatesOf, lessonIdsOf, relationId } from '@/lib/courses'
import type { Course } from '@/payload-types'

type ValidateArgs = { id?: number | string; req: PayloadRequest }

// The current request's transaction, so these writes commit or roll back with the course.
// Tables come from the adapter: importing the generated schema here would make the config
// depend on its own output.
async function drizzleFor(req: PayloadRequest) {
  const adapter = req.payload.db as unknown as PostgresAdapter
  const transactionID = req.transactionID ? await req.transactionID : undefined
  return {
    db: (transactionID !== undefined && adapter.sessions[transactionID]?.db) || adapter.drizzle,
    lessons: adapter.tables.lessons,
    _lessons_v: adapter.tables._lessons_v,
  }
}

// A lesson's `course` mirrors the syllabus of the course as last published (its main row). It is
// written straight to the lesson row and to every version of it, so it never creates a version,
// never touches a pending draft, and publishing or restoring an old version keeps it current.
export async function syncLessonCourse(req: PayloadRequest, courseId: string) {
  const course = await req.payload.findByID({
    collection: 'courses',
    id: courseId,
    depth: 0,
    // Nested on purpose: `{ modules: true }` returns empty `lessons` in Payload 4.0.0-beta.2
    select: { modules: { lessons: true } },
    overrideAccess: true,
    req,
  })
  const ids = lessonIdsOf(course.modules)
  const { db, lessons, _lessons_v } = await drizzleFor(req)
  const listed = sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  )

  for (const { table, lesson, key } of [
    { table: lessons, lesson: lessons.id, key: 'course' },
    { table: _lessons_v, lesson: _lessons_v.parent, key: 'version_course' },
  ]) {
    const dropped = ids.length ? sql` and ${lesson} not in (${listed})` : sql``
    await db
      .update(table)
      .set({ [key]: null })
      .where(sql`${table[key]} = ${courseId}${dropped}`)
    if (ids.length) {
      await db
        .update(table)
        .set({ [key]: courseId })
        .where(sql`${lesson} in (${listed})`)
    }
  }
}

// A lesson sits once in one course, and its slug is unique among that course's lessons
export async function validateModules(value: unknown, { id, req }: ValidateArgs) {
  const ids = lessonIdsOf(value as Course['modules'])
  if (!ids.length) return true

  const { docs } = await req.payload.find({
    collection: 'lessons',
    where: { id: { in: ids } },
    draft: true,
    depth: 0,
    pagination: false,
    select: { title: true, slug: true, course: true },
    overrideAccess: true,
    req,
  })
  const titleOf = (lessonId: string) => docs.find((doc) => doc.id === lessonId)?.title ?? lessonId

  const repeated = duplicatesOf(ids)
  if (repeated.length) {
    return `A lesson can appear only once in a course: ${repeated.map(titleOf).join(', ')}.`
  }
  const taken = docs.filter((doc) => {
    const courseId = relationId(doc.course)
    return courseId !== null && courseId !== id
  })
  if (taken.length) {
    return `Already in another course, remove them there first: ${taken.map((doc) => doc.title).join(', ')}.`
  }
  const clashing = duplicatesOf(docs.map((doc) => doc.slug))
  if (clashing.length) {
    return `Lessons in a course need different slugs: ${clashing.join(', ')}.`
  }
  return true
}

export async function validateLessonSlug(
  value: string | null | undefined,
  { id, req }: ValidateArgs,
) {
  if (!value) return 'A slug is required.'
  if (!id) return true
  const lesson = await req.payload.findByID({
    collection: 'lessons',
    id,
    depth: 0,
    select: { course: true },
    overrideAccess: true,
    disableErrors: true,
    req,
  })
  const courseId = relationId(lesson?.course)
  if (!courseId) return true

  const { docs } = await req.payload.find({
    collection: 'lessons',
    where: { course: { equals: courseId }, slug: { equals: value }, id: { not_equals: id } },
    draft: true,
    depth: 0,
    limit: 1,
    select: { title: true },
    overrideAccess: true,
    req,
  })
  return docs[0] ? `"${docs[0].title}" already uses this slug in the same course.` : true
}
