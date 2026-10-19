import type { Block, Field } from 'payload'

import { linkField } from '@/fields/link'
import { chartTypes, parseChartData } from '@/lib/chart-data'
import { validateExpression } from '@/lib/math-expression'

import { nestedEditor } from './nested'

// Each block's renderer is in src/components/rich-text/blocks; see docs/editor.md before adding one

const caption: Field = { name: 'caption', type: 'text' }

export const linkBlock: Block = {
  slug: 'link',
  interfaceName: 'LinkBlock',
  fields: [{ name: 'label', type: 'text', required: true }, linkField({ appearance: true })],
}

export const calloutBlock: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: ['info', 'tip', 'warning', 'danger'],
    },
    { name: 'title', type: 'text' },
    { name: 'content', type: 'richText', required: true, editor: nestedEditor },
  ],
}

export const videoBlock: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  fields: [
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { like: 'video/' } },
      admin: { description: 'Its duration adds to the lesson reading time.' },
    },
    caption,
  ],
}

export const chartBlock: Block = {
  slug: 'chart',
  interfaceName: 'ChartBlock',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'bar',
          options: [...chartTypes],
        },
        {
          name: 'xColumn',
          label: 'X-axis column',
          type: 'text',
          admin: { description: 'Labels or categories. The first column when empty.' },
        },
      ],
    },
    { name: 'title', type: 'text' },
    {
      name: 'data',
      label: 'Data (CSV)',
      type: 'textarea',
      required: true,
      admin: {
        rows: 8,
        description:
          'A header row, then one row per point. Every column but the x-axis one is a series of numbers. Pie charts take one series.',
        placeholder: 'month,visits,signups\nJanuary,1200,40\nFebruary,1500,52',
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: unknown }) => {
        const { type, xColumn } = siblingData as {
          type?: (typeof chartTypes)[number]
          xColumn?: string
        }
        const parsed = parseChartData(value ?? '', { type, xColumn })
        return 'error' in parsed ? parsed.error : true
      },
    },
    caption,
  ],
}

const range = (axis: 'x' | 'y', min: number, max: number): Field[] => [
  { name: `${axis}Min`, type: 'number', required: true, defaultValue: min },
  {
    name: `${axis}Max`,
    type: 'number',
    required: true,
    defaultValue: max,
    validate: (value: number | null | undefined, { siblingData }: { siblingData: unknown }) => {
      const minimum = (siblingData as Record<string, number | undefined>)[`${axis}Min`]
      if (typeof value !== 'number') return 'Required.'
      return typeof minimum !== 'number' || value > minimum ? true : 'Must be above the minimum.'
    },
  },
]

export const functionPlotBlock: Block = {
  slug: 'functionPlot',
  interfaceName: 'FunctionPlotBlock',
  labels: { singular: 'Function plot', plural: 'Function plots' },
  fields: [
    { type: 'row', fields: [...range('x', -5, 5), ...range('y', -5, 5)] },
    {
      type: 'row',
      fields: [
        { name: 'xLabel', type: 'text', defaultValue: 'x' },
        { name: 'yLabel', type: 'text', defaultValue: 'y' },
      ],
    },
    {
      name: 'hideNumbers',
      type: 'checkbox',
      label: 'Hide the axis numbers (conceptual plot)',
    },
    {
      name: 'curves',
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'expression',
              type: 'text',
              required: true,
              admin: {
                placeholder: '2x^2 - sin(x)',
                description: 'In x: + - * / ^, pi, e, sin, cos, sqrt, ln, log…',
              },
              validate: (value: unknown) => validateExpression(value),
            },
            { name: 'label', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'shade',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'No shading', value: 'none' },
                { label: 'Shade above', value: 'above' },
                { label: 'Shade below', value: 'below' },
              ],
            },
            {
              name: 'shadeFrom',
              type: 'number',
              admin: {
                condition: (_, row) => row?.shade && row.shade !== 'none',
                description: 'Left end. The plot edge when empty.',
              },
            },
            {
              name: 'shadeTo',
              type: 'number',
              admin: {
                condition: (_, row) => row?.shade && row.shade !== 'none',
                description: 'Right end. The plot edge when empty.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'points',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'x', type: 'number', required: true },
            { name: 'y', type: 'number', required: true },
            { name: 'label', type: 'text' },
          ],
        },
      ],
    },
    caption,
  ],
}

export const funnelBlock: Block = {
  slug: 'funnel',
  interfaceName: 'FunnelBlock',
  fields: [
    {
      name: 'stages',
      type: 'array',
      minRows: 2,
      admin: {
        description:
          'Give every stage a value to show conversion rates, or none for a conceptual funnel.',
      },
      validate: (rows: unknown) => {
        if (!Array.isArray(rows)) return true
        const withValue = rows.filter((row: { value?: unknown }) => typeof row.value === 'number')
        if (withValue.length && withValue.length !== rows.length) {
          return 'Give every stage a value, or none.'
        }
        return withValue.length && !(rows[0].value > 0)
          ? 'The first stage needs a value above 0.'
          : true
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'number', min: 0 },
          ],
        },
        { name: 'description', type: 'text' },
      ],
    },
    caption,
  ],
}

export const collapsibleBlock: Block = {
  slug: 'collapsible',
  interfaceName: 'CollapsibleBlock',
  fields: [
    { name: 'title', type: 'text', required: true, admin: { placeholder: 'Show the solution' } },
    { name: 'content', type: 'richText', required: true, editor: nestedEditor },
  ],
}
