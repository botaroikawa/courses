import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import type { CatalogueEntry } from '@/lib/course-data'
import { formatMinutes } from '@/lib/format'
import { coursePath } from '@/lib/paths'

export async function CourseCard({
  course,
  heading: Heading = 'h2',
}: {
  course: CatalogueEntry
  // h3 when the grid sits under its own h2
  heading?: 'h2' | 'h3'
}) {
  const [t, locale] = await Promise.all([getTranslations('course'), getLocale()])
  return (
    // The title link covers the whole card
    <Card className="relative pt-0 transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
      <div className="relative aspect-video bg-muted">
        {course.cover?.url && (
          <Image
            src={course.cover.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
            unoptimized={course.cover.visibility !== 'public'}
            className="object-cover"
          />
        )}
      </div>
      <CardHeader>
        <div className="flex flex-wrap gap-1.5">
          {course.featured && <Badge>{t('featured')}</Badge>}
          <Badge variant="secondary">{t(`levels.${course.level}`)}</Badge>
          {course.category && <Badge variant="outline">{course.category.name}</Badge>}
        </div>
        <CardTitle className="mt-2 text-lg">
          <Heading>
            <Link
              href={coursePath(course.slug)}
              className="outline-none after:absolute after:inset-0"
            >
              {course.title}
            </Link>
          </Heading>
        </CardTitle>
        <CardDescription className="line-clamp-3">{course.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="border-t py-3 text-muted-foreground">
        {t('lessons', { count: course.lessonCount })}
        {course.minutes > 0 && <> · {formatMinutes(course.minutes, locale)}</>}
      </CardFooter>
    </Card>
  )
}

export function CourseGrid({
  courses,
  heading,
}: {
  courses: CatalogueEntry[]
  heading?: 'h2' | 'h3'
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <li key={course.id} className="flex [&>*]:flex-1">
          <CourseCard course={course} heading={heading} />
        </li>
      ))}
    </ul>
  )
}
