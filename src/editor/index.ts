import {
  BlockquoteFeature,
  BlocksFeature,
  ChecklistFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  lexicalEditor,
  TableFeature,
} from '@payloadcms/richtext-lexical'

import {
  calloutBlock,
  chartBlock,
  collapsibleBlock,
  functionPlotBlock,
  funnelBlock,
  linkBlock,
  videoBlock,
} from './blocks'
import { codeBlock } from './code-block'
import { imageFeature, textFeatures } from './nested'

export { basicEditor } from './nested'

// The shared editor of lessons and pages (docs/editor.md). H1 is the document's title.
export const contentEditor = lexicalEditor({
  features: () => [
    ...textFeatures(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    ChecklistFeature(),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    TableFeature(),
    imageFeature(),
    BlocksFeature({
      blocks: [
        linkBlock,
        codeBlock,
        calloutBlock,
        videoBlock,
        chartBlock,
        functionPlotBlock,
        funnelBlock,
        collapsibleBlock,
      ],
    }),
    FixedToolbarFeature(),
  ],
})
