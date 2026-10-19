import { cn } from 'cn'
import { InfoIcon, LightbulbIcon, OctagonAlertIcon, TriangleAlertIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { CalloutBlock } from '@/payload-types'

const kinds = {
  info: { Icon: InfoIcon, className: 'border-sky-500/30 bg-sky-500/5 *:[svg]:text-sky-600' },
  tip: {
    Icon: LightbulbIcon,
    className: 'border-emerald-500/30 bg-emerald-500/5 *:[svg]:text-emerald-600',
  },
  warning: {
    Icon: TriangleAlertIcon,
    className: 'border-amber-500/40 bg-amber-500/5 *:[svg]:text-amber-600',
  },
  danger: {
    Icon: OctagonAlertIcon,
    className: 'border-destructive/40 bg-destructive/5 *:[svg]:text-destructive',
  },
} satisfies Record<CalloutBlock['kind'], { Icon: typeof InfoIcon; className: string }>

export async function Callout({
  kind,
  title,
  children,
}: Pick<CalloutBlock, 'kind' | 'title'> & { children: ReactNode }) {
  const t = await getTranslations('content.callout')
  const { Icon, className } = kinds[kind] ?? kinds.info
  return (
    // A note in the text, not an alert to announce
    <Alert role="note" className={cn('mt-6 px-4 py-3 first:mt-0', className)}>
      <Icon aria-hidden />
      <AlertTitle>
        <span className="sr-only">{title ? `${t(kind)}: ` : t(kind)}</span>
        {title}
      </AlertTitle>
      <AlertDescription className="text-foreground [&_p]:mt-2 [&_p]:first:mt-0">
        {children}
      </AlertDescription>
    </Alert>
  )
}
