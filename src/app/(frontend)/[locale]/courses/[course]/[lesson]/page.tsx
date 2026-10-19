import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, LockIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LessonOutline } from '@/components/courses/lesson-outline'
import { RichText } from '@/components/rich-text'
import { TableOfContents } from '@/components/rich-text/table-of-contents'
import { LivePreviewListener } from '@/components/site/live-preview-listener'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getPublishedLocales, mediaOf } from '@/lib/content'
import { canReadLesson, getLesson, getLessonContent } from '@/lib/course-data'
import { cataloguePath, coursePath, lessonPath, localizedHref } from '@/lib/paths'
import { headingAnchors } from '@/lib/rich-text'
import { alternatesFor } from '@/lib/seo'
import { getSession } from '@/lib/session'

type Props = { params: Promise<{ locale: string; course: string; lesson: string }> }

const resolve = async (params: Props['params']) =>
  (await params) as { locale: Locale; course: string; lesson: string }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, course, lesson: slug } = await resolve(params)
  const detail = await getLesson(course, slug, locale)
  if (!detail) return {}
  const { lesson } = detail
  // A lesson exists in a language once both it and its course are published there
  const [lessonLocales, courseLocales] = await Promise.all([
    getPublishedLocales('lessons', lesson.id),
    getPublishedLocales('courses', detail.course.id),
  ])
  const image = mediaOf(lesson.meta?.image)
  return {
    title: lesson.meta?.title || lesson.title,
    description: lesson.meta?.description || lesson.summary || detail.course.summary,
    // Search engines cannot read lessons behind sign-in, so only free previews are indexed
    robots: lesson.freePreview ? undefined : { index: false },
    alternates: alternatesFor(
      lessonPath(detail.course.slug, lesson.slug),
      locale,
      lessonLocales.filter((l) => courseLocales.includes(l)),
    ),
    openGraph: image?.url
      ? { images: [{ url: image.url, alt: image.alt ?? undefined }] }
      : undefined,
  }
}

export default async function LessonPage({ params }: Props) {
  const { locale, course: courseSlug, lesson: slug } = await resolve(params)
  setRequestLocale(locale)
  const [detail, session, { isEnabled: isDraft }, t, tc, tContent] = await Promise.all([
    getLesson(courseSlug, slug, locale),
    getSession(),
    draftMode(),
    getTranslations('lesson'),
    getTranslations('catalogue'),
    getTranslations('content'),
  ])
  if (!detail) notFound()
  const { course, syllabus, lesson, position, previous, next, lessonCount } = detail
  const readable = await canReadLesson(lesson)
  const content = readable ? await getLessonContent(lesson.id, locale) : null
  const hasContents = headingAnchors(content).some(({ level }) => level <= 3)
  const here = localizedHref(lessonPath(course.slug, lesson.slug), locale)

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_14rem]">
      {isDraft && <LivePreviewListener />}
      <aside className="hidden lg:block">
        <div className="sticky top-6 max-h-[calc(100svh-3rem)] overflow-y-auto">
          <LessonOutline
            course={course}
            syllabus={syllabus}
            currentId={lesson.id}
            signedIn={Boolean(session)}
          />
        </div>
      </aside>

      <article className="flex min-w-0 flex-col gap-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={cataloguePath} />}>{tc('title')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={coursePath(course.slug)} />}>
                {course.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            {t('position', { position: position + 1, total: lessonCount })}
            {lesson.readingTime ? ` · ${lesson.readingTime} min` : null}
          </p>
          <h1 className="font-semibold text-4xl tracking-tight">{lesson.title}</h1>
        </header>

        {readable ? (
          <>
            {hasContents && (
              <Collapsible className="rounded-lg border xl:hidden">
                <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 font-medium text-sm">
                  {tContent('tableOfContents')}
                  <ChevronDownIcon
                    aria-hidden
                    className="size-4 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t px-4 py-3">
                  <TableOfContents data={content} hideTitle />
                </CollapsibleContent>
              </Collapsible>
            )}
            <RichText data={content} />
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockIcon aria-hidden className="size-4" />
                <h2>{t('lockedTitle')}</h2>
              </CardTitle>
              <CardDescription>
                {lesson.summary && <p className="mb-2">{lesson.summary}</p>}
                <p>{t('lockedDescription')}</p>
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-wrap gap-2">
              <Button
                nativeButton={false}
                render={<Link href={{ pathname: '/register', query: { redirect: here } }} />}
              >
                {t('signUp')}
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={{ pathname: '/login', query: { redirect: here } }} />}
              >
                {t('signIn')}
              </Button>
            </CardFooter>
          </Card>
        )}

        <nav className="flex justify-between gap-4 border-t pt-6">
          {previous ? (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={lessonPath(course.slug, previous.slug)} rel="prev" />}
              className="h-auto max-w-[48%] justify-start py-2 text-left whitespace-normal"
            >
              <ArrowLeftIcon aria-hidden />
              <span className="flex flex-col">
                <span className="text-muted-foreground text-xs">{t('previous')}</span>
                {previous.title}
              </span>
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={lessonPath(course.slug, next.slug)} rel="next" />}
              className="h-auto max-w-[48%] justify-end py-2 text-right whitespace-normal"
            >
              <span className="flex flex-col">
                <span className="text-muted-foreground text-xs">{t('next')}</span>
                {next.title}
              </span>
              <ArrowRightIcon aria-hidden />
            </Button>
          )}
        </nav>
      </article>

      {hasContents && (
        <aside className="hidden xl:block">
          <div className="sticky top-6">
            <TableOfContents data={content} />
          </div>
        </aside>
      )}
    </div>
  )
}
