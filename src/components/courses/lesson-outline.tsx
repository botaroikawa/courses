import { LockIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { SyllabusModule } from '@/lib/catalogue'
import type { SyllabusEntry } from '@/lib/course-data'
import { coursePath, lessonPath } from '@/lib/paths'

// The course's syllabus beside a lesson, with the current one marked
export async function LessonOutline({
  course,
  syllabus,
  currentId,
  signedIn,
}: {
  course: { slug: string; title: string }
  syllabus: SyllabusModule<SyllabusEntry>[]
  currentId: string
  signedIn: boolean
}) {
  const t = await getTranslations('lesson')
  const tc = await getTranslations('course')
  return (
    <nav aria-label={t('courseOutline')} className="flex flex-col gap-4 text-sm">
      <Link href={coursePath(course.slug)} className="font-semibold hover:underline">
        {course.title}
      </Link>
      {syllabus.map((module) => (
        <div key={module.id} className="flex flex-col gap-1">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {module.title}
          </p>
          <ol className="flex flex-col">
            {module.lessons.map((lesson) => {
              const current = lesson.id === currentId
              return (
                <li key={lesson.id}>
                  <Link
                    href={lessonPath(course.slug, lesson.slug)}
                    aria-current={current ? 'page' : undefined}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                  >
                    <span>{lesson.title}</span>
                    {!lesson.freePreview && !signedIn && (
                      <LockIcon aria-label={tc('locked')} className="size-3.5 shrink-0" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </nav>
  )
}
