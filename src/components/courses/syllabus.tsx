import { LockIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { isNewLesson, type SyllabusModule } from '@/lib/catalogue'
import type { SyllabusEntry } from '@/lib/course-data'
import { lessonPath } from '@/lib/paths'

export async function Syllabus({
  courseSlug,
  coursePublishedAt,
  syllabus,
  signedIn,
}: {
  courseSlug: string
  coursePublishedAt?: string | null
  syllabus: SyllabusModule<SyllabusEntry>[]
  signedIn: boolean
}) {
  const t = await getTranslations('course')
  let number = 0

  return (
    <div className="flex flex-col gap-4">
      {syllabus.map((module) => (
        <Card key={module.id} size="sm">
          <CardHeader>
            <CardTitle>
              <h3 className="font-semibold">{module.title}</h3>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col divide-y">
              {module.lessons.map((lesson) => {
                number++
                const locked = !lesson.freePreview && !signedIn
                return (
                  <li key={lesson.id} className="flex items-start gap-3 py-2.5">
                    <span className="w-6 shrink-0 pt-px text-right text-muted-foreground tabular-nums">
                      {number}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={lessonPath(courseSlug, lesson.slug)}
                          className="font-medium hover:underline"
                        >
                          {lesson.title}
                        </Link>
                        {lesson.freePreview && !signedIn && (
                          <Badge variant="secondary">{t('preview')}</Badge>
                        )}
                        {isNewLesson(lesson.firstPublishedAt, coursePublishedAt) && (
                          <Badge>{t('new')}</Badge>
                        )}
                      </div>
                      {lesson.summary && (
                        <p className="line-clamp-2 text-muted-foreground">{lesson.summary}</p>
                      )}
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 pt-px text-muted-foreground tabular-nums">
                      {locked && <LockIcon aria-label={t('locked')} className="size-3.5" />}
                      {lesson.readingTime ? `${lesson.readingTime} min` : null}
                    </span>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
