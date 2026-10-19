import { CheckIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Syllabus } from '@/components/courses/syllabus'
import { RichText } from '@/components/rich-text'
import { LivePreviewListener } from '@/components/site/live-preview-listener'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { syllabusLessons } from '@/lib/catalogue'
import { getPublishedLocales, getSiteGlobals, mediaOf } from '@/lib/content'
import { getCourse } from '@/lib/course-data'
import { formatMinutes } from '@/lib/format'
import { cataloguePath, categoryPath, coursePath, instructorPath, lessonPath } from '@/lib/paths'
import { absoluteUrl, alternatesFor, jsonLd } from '@/lib/seo'
import { getSession } from '@/lib/session'

type Props = { params: Promise<{ locale: string; course: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, course: slug } = (await params) as { locale: Locale; course: string }
  const detail = await getCourse(slug, locale)
  if (!detail) return {}
  const { course } = detail
  const image = mediaOf(course.meta?.image) ?? mediaOf(course.cover)
  return {
    title: course.meta?.title || course.title,
    description: course.meta?.description || course.summary,
    alternates: alternatesFor(
      coursePath(course.slug),
      locale,
      await getPublishedLocales('courses', course.id),
    ),
    openGraph: image?.url
      ? { images: [{ url: image.url, alt: image.alt ?? undefined }] }
      : undefined,
  }
}

export default async function CoursePage({ params }: Props) {
  const { locale, course: slug } = (await params) as { locale: Locale; course: string }
  setRequestLocale(locale)
  const [detail, session, { isEnabled: isDraft }, t, tc, { brand }] = await Promise.all([
    getCourse(slug, locale),
    getSession(),
    draftMode(),
    getTranslations('course'),
    getTranslations('catalogue'),
    getSiteGlobals(locale),
  ])
  if (!detail) notFound()
  const { course, category, instructors, syllabus, lessonCount, minutes } = detail
  const cover = mediaOf(course.cover)
  const first = syllabusLessons(syllabus)[0]

  return (
    <article className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      {isDraft && <LivePreviewListener />}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: escaped by jsonLd
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@type': 'Course',
            name: course.title,
            description: course.summary,
            url: absoluteUrl(coursePath(course.slug), locale),
            inLanguage: locale,
            isAccessibleForFree: true,
            provider: { '@type': 'Organization', name: brand.siteName },
            ...(cover?.url ? { image: cover.url } : {}),
          }),
        }}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={cataloguePath} />}>{tc('title')}</BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={categoryPath(category.slug)} />}>
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="grid items-center gap-8 lg:grid-cols-[1fr_28rem]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{t(`levels.${course.level}`)}</Badge>
            {category && <Badge variant="outline">{category.name}</Badge>}
          </div>
          <h1 className="font-semibold text-4xl tracking-tight">{course.title}</h1>
          <p className="text-lg text-muted-foreground">{course.summary}</p>
          <p className="text-muted-foreground text-sm">
            {t('lessons', { count: lessonCount })}
            {minutes > 0 && <> · {formatMinutes(minutes, locale)}</>}
          </p>
          {first && (
            <div>
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href={lessonPath(course.slug, first.slug)} />}
              >
                {t('start')}
              </Button>
            </div>
          )}
        </div>
        {cover?.url && (
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            <Image
              src={cover.url}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 448px, 100vw"
              unoptimized={cover.visibility !== 'public'}
              className="object-cover"
            />
          </div>
        )}
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-10">
          {course.description && <RichText data={course.description} />}

          {course.outcomes?.length ? (
            <section className="flex flex-col gap-4">
              <h2 className="font-semibold text-2xl tracking-tight">{t('outcomes')}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((outcome) => (
                  <li key={outcome.id} className="flex gap-2">
                    <CheckIcon aria-hidden className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    {outcome.text}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">{t('syllabus')}</h2>
            {syllabus.length ? (
              <Syllabus
                courseSlug={course.slug}
                coursePublishedAt={course.firstPublishedAt}
                syllabus={syllabus}
                signedIn={Boolean(session)}
              />
            ) : (
              <p className="text-muted-foreground">{t('noLessons')}</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-8">
          {course.requirements?.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="font-semibold text-lg">{t('requirements')}</h2>
              <ul className="ml-5 flex list-disc flex-col gap-1.5 text-muted-foreground">
                {course.requirements.map((requirement) => (
                  <li key={requirement.id}>{requirement.text}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {instructors.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-semibold text-lg">{t('instructors')}</h2>
              <ul className="flex flex-col gap-3">
                {instructors.map((instructor) => {
                  const photo = mediaOf(instructor.photo)
                  return (
                    <li key={instructor.id} className="flex items-center gap-3">
                      <Avatar className="size-10">
                        {photo?.url && <AvatarImage src={photo.url} alt="" />}
                        <AvatarFallback>{instructor.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Link
                          href={instructorPath(instructor.slug)}
                          className="font-medium hover:underline"
                        >
                          {instructor.name}
                        </Link>
                        {instructor.headline && (
                          <span className="text-muted-foreground text-sm">
                            {instructor.headline}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  )
}
