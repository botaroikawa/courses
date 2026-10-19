import { SearchXIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CatalogueFilters } from '@/components/courses/catalogue-filters'
import { CourseGrid } from '@/components/courses/course-card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { type Locale, locales } from '@/i18n/routing'
import { applyCatalogueQuery, parseCatalogueQuery } from '@/lib/catalogue'
import { getCatalogue, getCategories } from '@/lib/course-data'
import { cataloguePath } from '@/lib/paths'
import { alternatesFor } from '@/lib/seo'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const t = await getTranslations({ locale, namespace: 'catalogue' })
  return {
    title: t('title'),
    description: t('description'),
    // Sorted and filtered views share the catalogue's one canonical URL
    alternates: alternatesFor(cataloguePath, locale, locales),
  }
}

export default async function CataloguePage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const [t, courses, categories, search] = await Promise.all([
    getTranslations('catalogue'),
    getCatalogue(locale),
    getCategories(locale),
    searchParams,
  ])
  // Only categories with a course in this language are worth filtering by
  const usedCategories = categories.filter((category) =>
    courses.some((course) => course.categorySlug === category.slug),
  )
  const query = parseCatalogueQuery(
    search,
    usedCategories.map((category) => category.slug),
  )
  const results = applyCatalogueQuery(courses, query, locale)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-4xl tracking-tight">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </header>
      {courses.length === 0 ? (
        <p className="text-muted-foreground">{t('noCourses')}</p>
      ) : (
        <>
          <CatalogueFilters
            categories={usedCategories.map((category) => ({
              value: category.slug,
              label: category.name,
            }))}
          />
          <p aria-live="polite" className="text-muted-foreground text-sm">
            {t('results', { count: results.length })}
          </p>
          {results.length ? (
            <CourseGrid courses={results} />
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>{t('emptyTitle')}</EmptyTitle>
                <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </>
      )}
    </div>
  )
}
