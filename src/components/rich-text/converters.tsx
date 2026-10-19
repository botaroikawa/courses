import type { JSXConverters } from '@payloadcms/richtext-lexical/react'
import { cn } from 'cn'
import type { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'
import { type LinkHrefs, resolveLink } from '@/lib/links'
import type {
  CalloutBlock as CalloutFields,
  ChartBlock as ChartFields,
  CodeBlock as CodeFields,
  CollapsibleBlock as CollapsibleFields,
  FunctionPlotBlock as FunctionPlotFields,
  FunnelBlock as FunnelFields,
  LinkBlock as LinkFields,
  Media,
  VideoBlock as VideoFields,
} from '@/payload-types'

import { Callout } from './blocks/callout'
import { Chart } from './blocks/chart'
import { Code } from './blocks/code'
import { CollapsibleSection } from './blocks/collapsible'
import { FunctionPlot } from './blocks/function-plot'
import { Funnel } from './blocks/funnel'
import { LinkBlock } from './blocks/link-block'
import { Video } from './blocks/video'
import { Figure } from './figure'
import { ZoomableImage } from './zoomable-image'

// Vertical rhythm: every top-level element is spaced from the one before it
export const flow = 'mt-6 first:mt-0'

// Lexical's text format bit flags
const format = { bold: 1, italic: 2, strikethrough: 4, underline: 8, code: 16, sub: 32, sup: 64 }

// Serialized nodes as the converters receive them; their shapes are Lexical's
// biome-ignore lint/suspicious/noExplicitAny: Lexical node types vary per converter
type Node = Record<string, any>
// biome-ignore lint/suspicious/noExplicitAny: see Node
type Args = { node: Node; parent: Node; nodesToJSX: (args: { nodes: any[] }) => ReactNode[] }
// A block converter receives its block's fields, typed from payload-types
const block =
  <T,>(render: (fields: T, args: Args) => ReactNode) =>
  (args: Args) =>
    render(args.node.fields as T, args)

export function buildConverters({
  hrefs,
  anchors,
}: {
  hrefs: LinkHrefs
  anchors: WeakMap<object, string>
}): JSXConverters {
  const children = ({ node, nodesToJSX }: Args) => nodesToJSX({ nodes: node.children ?? [] })

  return {
    paragraph: (args: Args) => <p className={cn(flow, 'leading-7')}>{children(args)}</p>,
    linebreak: <br />,
    tab: '\t',
    text: ({ node }: Args) => {
      let text: ReactNode = node.text
      const has = (flag: number) => (node.format ?? 0) & flag
      if (has(format.code)) {
        text = (
          <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">{text}</code>
        )
      }
      if (has(format.bold)) text = <strong className="font-semibold">{text}</strong>
      if (has(format.italic)) text = <em>{text}</em>
      if (has(format.underline)) text = <u className="underline-offset-4">{text}</u>
      if (has(format.strikethrough)) text = <s>{text}</s>
      if (has(format.sub)) text = <sub>{text}</sub>
      if (has(format.sup)) text = <sup>{text}</sup>
      return text
    },
    heading: (args: Args) => {
      const Tag = (/^h[2-6]$/.test(args.node.tag ?? '') ? args.node.tag : 'h2') as 'h2'
      const styles: Record<string, string> = {
        h2: 'mt-12 border-b pb-2 text-2xl font-semibold tracking-tight',
        h3: 'mt-8 text-xl font-semibold tracking-tight',
        h4: 'mt-6 text-lg font-semibold tracking-tight',
      }
      return (
        <Tag
          id={anchors.get(args.node)}
          className={cn('scroll-mt-24 first:mt-0', styles[Tag] ?? styles.h4)}
        >
          {children(args)}
        </Tag>
      )
    },
    quote: (args: Args) => (
      <blockquote className={cn(flow, 'border-l-2 pl-6 italic')}>{children(args)}</blockquote>
    ),
    horizontalrule: <Separator className="my-10" />,
    list: (args: Args) => {
      const ordered = args.node.listType === 'number'
      const Tag = ordered ? 'ol' : 'ul'
      return (
        <Tag
          className={cn(
            flow,
            'ml-6 [&>li]:mt-2 [&_ol]:mt-2 [&_ul]:mt-2',
            args.node.listType === 'check'
              ? 'ml-0 list-none'
              : ordered
                ? 'list-decimal'
                : 'list-disc',
          )}
        >
          {children(args)}
        </Tag>
      )
    },
    listitem: (args: Args) => {
      const nested = args.node.children?.some((child: Node) => child.type === 'list')
      if (args.parent.listType === 'check' && !nested) {
        return (
          <li className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={Boolean(args.node.checked)}
              readOnly
              disabled
              className="mt-1.5 size-4 accent-primary"
            />
            <span>{children(args)}</span>
          </li>
        )
      }
      return (
        <li value={args.node.value} className={nested ? 'list-none' : undefined}>
          {children(args)}
        </li>
      )
    },
    link: (args: Args) => {
      const { linkType, doc, url, newTab } = (args.node.fields ?? {}) as Node
      const link = resolveLink(
        { type: linkType === 'internal' ? 'internal' : 'external', doc, url, newTab },
        hrefs,
      )
      // A target that is not published in this language reads as plain text
      if (!link) return <>{children(args)}</>
      const className = 'font-medium underline underline-offset-4'
      const target = link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
      return link.kind === 'internal' ? (
        <Link href={link.href} className={className} {...target}>
          {children(args)}
        </Link>
      ) : (
        <a href={link.href} className={className} {...target}>
          {children(args)}
        </a>
      )
    },
    autolink: (args: Args) => (
      <a href={args.node.fields?.url} className="font-medium underline underline-offset-4">
        {children(args)}
      </a>
    ),
    table: (args: Args) => (
      <div className={flow}>
        <Table>
          <TableBody>{children(args)}</TableBody>
        </Table>
      </div>
    ),
    tablerow: (args: Args) => <TableRow>{children(args)}</TableRow>,
    tablecell: (args: Args) => {
      const Cell = args.node.headerState > 0 ? TableHead : TableCell
      return (
        <Cell
          colSpan={args.node.colSpan > 1 ? args.node.colSpan : undefined}
          rowSpan={args.node.rowSpan > 1 ? args.node.rowSpan : undefined}
          className="whitespace-normal border"
        >
          {children(args)}
        </Cell>
      )
    },
    upload: ({ node }: { node: { value: unknown; fields?: { caption?: string | null } } }) => {
      const media = node.value && typeof node.value === 'object' ? (node.value as Media) : null
      if (!media?.url) return null
      if (!media.mimeType?.startsWith('image/')) {
        return (
          <p className={flow}>
            <a href={media.url} className="font-medium underline underline-offset-4">
              {media.filename}
            </a>
          </p>
        )
      }
      return (
        <Figure caption={node.fields?.caption}>
          <ZoomableImage media={media} />
        </Figure>
      )
    },
    blocks: {
      link: block<LinkFields>((fields) => <LinkBlock {...fields} hrefs={hrefs} />),
      code: block<CodeFields>((fields) => <Code {...fields} />),
      callout: block<CalloutFields>((fields, { nodesToJSX }) => (
        <Callout kind={fields.kind} title={fields.title}>
          {nodesToJSX({ nodes: fields.content?.root?.children ?? [] })}
        </Callout>
      )),
      video: block<VideoFields>((fields) => <Video {...fields} />),
      chart: block<ChartFields>((fields) => <Chart {...fields} />),
      functionPlot: block<FunctionPlotFields>((fields) => <FunctionPlot {...fields} />),
      funnel: block<FunnelFields>((fields) => <Funnel {...fields} />),
      collapsible: block<CollapsibleFields>((fields, { nodesToJSX }) => (
        <CollapsibleSection title={fields.title}>
          {nodesToJSX({ nodes: fields.content?.root?.children ?? [] })}
        </CollapsibleSection>
      )),
    },
  }
}
