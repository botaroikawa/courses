import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CourseGrid } from '@/components/courses/course-card'
import { RichText } from '@/components/rich-text'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { type Locale, locales } from '@/i18n/routing'
import { applyCatalogueQuery } from '@/lib/catalogue'
import { mediaOf } from '@/lib/content'
import { getCatalogue, getInstructor } from '@/lib/course-data'
import { instructorPath } from '@/lib/paths'
import { alternatesFor } from '@/lib/seo'

type Props = { params: Promise<{ locale: string; instructor: string }> }

const resolve = async (params: Props['params']) =>
  (await params) as { locale: Locale; instructor: string }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, instructor: slug } = await resolve(params)
  const instructor = await getInstructor(slug, locale)
  if (!instructor) return {}
  const photo = mediaOf(instructor.photo)
  return {
    title: instructor.name,
    description: instructor.headline ?? undefined,
    // Instructors have no drafts: they exist in every language, falling back to Spanish
    alternates: alternatesFor(instructorPath(instructor.slug), locale, locales),
    openGraph: photo?.url
      ? { images: [{ url: photo.url, alt: photo.alt ?? undefined }] }
      : undefined,
  }
}

export default async function InstructorPage({ params }: Props) {
  const { locale, instructor: slug } = await resolve(params)
  setRequestLocale(locale)
  const [instructor, catalogue, t] = await Promise.all([
    getInstructor(slug, locale),
    getCatalogue(locale),
    getTranslations('instructor'),
  ])
  if (!instructor) notFound()
  const photo = mediaOf(instructor.photo)
  const courses = applyCatalogueQuery(
    catalogue.filter((course) => course.instructorIds.includes(instructor.id)),
    { sort: 'newest' },
    locale,
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar className="size-24">
          {photo?.url && <AvatarImage src={photo.url} alt="" />}
          <AvatarFallback className="text-2xl">{instructor.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-4xl tracking-tight">{instructor.name}</h1>
          {instructor.headline && (
            <p className="text-lg text-muted-foreground">{instructor.headline}</p>
          )}
        </div>
      </header>
      {(instructor.bio || instructor.links?.length) && (
        <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
          <div className="max-w-3xl">{instructor.bio && <RichText data={instructor.bio} />}</div>
          {instructor.links?.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="font-semibold text-lg">{t('links')}</h2>
              <ul className="flex flex-col gap-1.5">
                {instructor.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      rel="noopener noreferrer me"
                      className="underline underline-offset-4"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
      {courses.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="font-semibold text-2xl tracking-tight">{t('courses')}</h2>
          <CourseGrid courses={courses} heading="h3" />
        </section>
      )}
    </div>
  )
}
