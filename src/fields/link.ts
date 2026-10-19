import type { Field, GroupField } from 'payload'

import { linkableCollections } from '@/lib/links'

const isInternal = (_: unknown, siblingData: { type?: string } | undefined) =>
  siblingData?.type !== 'external'
const isButton = (_: unknown, siblingData: { appearance?: string } | undefined) =>
  siblingData?.appearance === 'button'

// Shared link: the Link block, the header and the footer. Internal targets are documents, so a
// slug change never breaks a link (see src/lib/links.ts). `appearance` adds the button styling.
export const linkField = ({
  name = 'link',
  appearance = false,
}: {
  name?: string
  appearance?: boolean
} = {}): GroupField => ({
  name,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'internal',
          options: [
            { label: 'Page, course or lesson', value: 'internal' },
            { label: 'URL or site path', value: 'external' },
          ],
          admin: { layout: 'horizontal' },
        },
        { name: 'newTab', type: 'checkbox', label: 'Open in new tab' },
      ],
    },
    {
      name: 'doc',
      label: 'Target',
      type: 'relationship',
      relationTo: [...linkableCollections],
      required: true,
      // Resolved to an href when rendering, never populated
      maxDepth: 0,
      // A lesson outside every course has no URL yet
      filterOptions: ({ relationTo }) =>
        relationTo === 'lessons' ? { course: { exists: true } } : true,
      admin: { condition: isInternal },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      admin: {
        condition: (data, siblingData) => !isInternal(data, siblingData),
        description: 'A full URL, or a path on this site such as /courses (without the language).',
      },
      // Replaces the default validation, so it checks `required` too
      validate: (value: string | null | undefined) => {
        if (!value) return 'Enter a URL or a path.'
        return /^(https?:\/\/\S+|mailto:\S+|tel:\S+|\/(?!\/)\S*)$/.test(value)
          ? true
          : 'Enter a full URL (https://, mailto:, tel:) or a path starting with /.'
      },
    },
    ...(appearance
      ? ([
          {
            type: 'row',
            fields: [
              {
                name: 'appearance',
                type: 'select',
                defaultValue: 'link',
                required: true,
                options: [
                  { label: 'Link', value: 'link' },
                  { label: 'Button', value: 'button' },
                ],
              },
              {
                name: 'variant',
                type: 'select',
                defaultValue: 'default',
                options: ['default', 'secondary', 'outline', 'ghost'],
                admin: { condition: isButton },
              },
              {
                name: 'size',
                type: 'select',
                defaultValue: 'default',
                options: ['sm', 'default', 'lg'],
                admin: { condition: isButton },
              },
            ],
          },
        ] satisfies Field[])
      : []),
  ],
})

export const navItemsField: Field = {
  name: 'navItems',
  type: 'array',
  admin: { initCollapsed: true },
  fields: [{ name: 'label', type: 'text', required: true, localized: true }, linkField()],
}
