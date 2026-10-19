import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CourseGrid } from '@/components/courses/course-card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@/i18n/navigation'
import { type Locale, locales } from '@/i18n/routing'
import { applyCatalogueQuery } from '@/lib/catalogue'
import { getCatalogue, getCategories } from '@/lib/course-data'
import { cataloguePath, categoryPath } from '@/lib/paths'
import { alternatesFor } from '@/lib/seo'

type Props = { params: Promise<{ locale: string; category: string }> }

const resolve = async (params: Props['params']) => {
  const { locale, category: slug } = (await params) as { locale: Locale; category: string }
  const category = (await getCategories(locale)).find((c) => c.slug === slug)
  return { locale, category }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await resolve(params)
  if (!category) return {}
  return {
    title: category.name,
    description: category.description ?? undefined,
    // Categories have no drafts: they exist in every language, falling back to Spanish
    alternates: alternatesFor(categoryPath(category.slug), locale, locales),
  }
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category } = await resolve(params)
  if (!category) notFound()
  setRequestLocale(locale)
  const [t, catalogue] = await Promise.all([getTranslations('catalogue'), getCatalogue(locale)])
  const courses = applyCatalogueQuery(
    catalogue.filter((course) => course.categorySlug === category.slug),
    { sort: 'newest' },
    locale,
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={cataloguePath} />}>{t('title')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-4xl tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="max-w-3xl text-lg text-muted-foreground">{category.description}</p>
        )}
        <p className="text-muted-foreground text-sm">{t('results', { count: courses.length })}</p>
      </header>
      {courses.length > 0 && <CourseGrid courses={courses} />}
    </div>
  )
}
