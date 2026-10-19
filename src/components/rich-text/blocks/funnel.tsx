import { getLocale, getTranslations } from 'next-intl/server'

import type { FunnelBlock } from '@/payload-types'

import { Figure } from '../figure'
import { FunnelView } from './funnel-view'

// With values, each stage shows its share of the previous one; without, the funnel is conceptual
export async function Funnel({ stages, caption }: FunnelBlock) {
  if (!stages?.length) return null
  const [t, locale] = await Promise.all([getTranslations('content.funnel'), getLocale()])
  const measured = stages.every((stage) => typeof stage.value === 'number')
  const number = new Intl.NumberFormat(locale)
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 })
  const first = stages[0]?.value ?? 0
  const last = stages.at(-1)?.value ?? 0

  return (
    <Figure caption={caption}>
      <FunnelView
        measured={measured}
        stages={stages.map((stage, index) => ({
          label: stage.label,
          // A conceptual funnel narrows in equal steps
          value: measured ? (stage.value as number) : stages.length - index,
        }))}
      />
      <ol className="mt-4 flex flex-col gap-3 text-sm">
        {stages.map((stage, index) => {
          const previous = stages[index - 1]?.value
          return (
            <li key={stage.id ?? index} className="flex flex-col gap-0.5">
              <span className="font-medium">
                {index + 1}. {stage.label}
                {measured && (
                  <span className="text-muted-foreground">
                    {' '}
                    · {number.format(stage.value as number)}
                  </span>
                )}
              </span>
              {measured && index > 0 && previous ? (
                <span className="text-muted-foreground">
                  {t('ofPrevious', { rate: percent.format((stage.value as number) / previous) })}
                </span>
              ) : null}
              {stage.description && (
                <span className="text-muted-foreground">{stage.description}</span>
              )}
            </li>
          )
        })}
      </ol>
      {measured && first > 0 && stages.length > 2 && (
        <p className="mt-3 font-medium text-sm">
          {t('overall', { rate: percent.format(last / first) })}
        </p>
      )}
    </Figure>
  )
}
