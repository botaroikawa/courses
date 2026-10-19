import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import { cn } from 'cn'
import { getLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { getLinkHrefs } from '@/lib/content'
import { linkRefsIn } from '@/lib/links'
import { headingAnchors } from '@/lib/rich-text'

import { buildConverters } from './converters'

export type RichTextData = Parameters<typeof LexicalRichText>[0]['data']

// The one renderer for every Lexical field on the site (docs/editor.md)
export async function RichText({
  data,
  className,
}: {
  data: RichTextData | null | undefined
  className?: string
}) {
  if (!data) return null
  const locale = (await getLocale()) as Locale
  const hrefs = await getLinkHrefs(linkRefsIn(data), locale)
  const anchors = new WeakMap<object, string>(
    headingAnchors(data).map(({ node, id }) => [node, id]),
  )
  return (
    <LexicalRichText
      data={data}
      converters={buildConverters({ hrefs, anchors })}
      disableIndent
      disableTextAlign
      className={cn('text-base', className)}
    />
  )
}
