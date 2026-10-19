import {
  BlocksFeature,
  BoldFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

import { linkableCollections } from '@/lib/links'

import { codeBlock } from './code-block'

// Paragraphs, inline formatting, lists and links: what every editor shares
export const textFeatures = () => [
  ParagraphFeature(),
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  StrikethroughFeature(),
  InlineCodeFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
  // Internal links store the document; hrefs are resolved when rendering (src/lib/links.ts)
  LinkFeature({ enabledCollections: [...linkableCollections], maxDepth: 0 }),
  InlineToolbarFeature(),
]

export const imageFeature = () =>
  UploadFeature({
    collections: {
      media: { fields: [{ name: 'caption', type: 'text' }] },
    },
  })

// Short texts: course descriptions, instructor bios. The default editor of the config.
export const basicEditor = lexicalEditor({ features: textFeatures })

// Rich text inside a callout or a collapsible: no headings, so the table of contents stays flat
export const nestedEditor = lexicalEditor({
  features: () => [...textFeatures(), imageFeature(), BlocksFeature({ blocks: [codeBlock] })],
})
