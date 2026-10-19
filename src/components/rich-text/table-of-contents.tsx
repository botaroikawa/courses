import { cn } from 'cn'
import { getTranslations } from 'next-intl/server'

import { headingAnchors } from '@/lib/rich-text'

// H2 and H3 of a Lexical tree, with the same anchors <RichText> gives them
export async function TableOfContents({
  data,
  hideTitle,
  className,
}: {
  data: unknown
  // When a surrounding control already says "On this page"
  hideTitle?: boolean
  className?: string
}) {
  const headings = headingAnchors(data).filter(({ level }) => level <= 3)
  if (!headings.length) return null
  const t = await getTranslations('content')
  return (
    <nav aria-label={t('tableOfContents')} className={cn('text-sm', className)}>
      {!hideTitle && <p className="mb-3 font-medium">{t('tableOfContents')}</p>}
      <ol className="flex flex-col gap-2">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={level === 3 ? 'pl-4' : undefined}>
            <a href={`#${id}`} className="text-muted-foreground hover:text-foreground">
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
