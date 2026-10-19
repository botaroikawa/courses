'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePathname, useRouter } from '@/i18n/navigation'
import { catalogueSorts, durationBuckets } from '@/lib/catalogue'
import { courseLevelValues } from '@/lib/courses'

const ALL = 'all'

type Option = { value: string; label: string }

// Sort and filters live in the query string, so a filtered catalogue can be shared
export function CatalogueFilters({ categories }: { categories: Option[] }) {
  const t = useTranslations('catalogue')
  const tc = useTranslations('course')
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (!value || value === ALL || (key === 'sort' && value === 'newest')) next.delete(key)
    else next.set(key, value)
    const query = next.toString()
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    )
  }

  const filters: { key: string; label: string; all: string; options: Option[] }[] = [
    { key: 'category', label: t('category'), all: t('allCategories'), options: categories },
    {
      key: 'level',
      label: t('level'),
      all: t('allLevels'),
      options: courseLevelValues.map((value) => ({ value, label: tc(`levels.${value}`) })),
    },
    {
      key: 'duration',
      label: t('duration'),
      all: t('anyDuration'),
      options: durationBuckets.map((value) => ({ value, label: t(`durations.${value}`) })),
    },
  ]
  const sorts = catalogueSorts.map((value) => ({ value, label: t(`sort.${value}`) }))
  const filtered = filters.some(({ key }) => params.has(key))

  return (
    <div className="flex flex-wrap items-center gap-2" aria-busy={pending}>
      {filters.map(({ key, label, all, options }) => {
        const items = [{ value: ALL, label: all }, ...options]
        return (
          <Select
            key={key}
            items={items}
            value={params.get(key) ?? ALL}
            onValueChange={(value) => update(key, value as string | null)}
          >
            <SelectTrigger aria-label={label} className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      })}
      {filtered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Filters go, the sort stays
            const sort = params.get('sort')
            startTransition(() =>
              router.replace(sort ? `${pathname}?sort=${sort}` : pathname, { scroll: false }),
            )
          }}
        >
          {t('clearFilters')}
        </Button>
      )}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{t('sortLabel')}</span>
        <Select
          items={sorts}
          value={params.get('sort') ?? 'newest'}
          onValueChange={(value) => update('sort', value as string | null)}
        >
          <SelectTrigger aria-label={t('sortLabel')} className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sorts.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
