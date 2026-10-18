import type { Field } from 'payload'

// Reusable link: either an internal page or an external URL
export const linkField = (name = 'link'): Field => ({
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
            { label: 'Internal page', value: 'internal' },
            { label: 'External URL', value: 'external' },
          ],
          admin: { layout: 'horizontal' },
        },
        { name: 'newTab', type: 'checkbox', label: 'Open in new tab' },
      ],
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
      admin: { condition: (_, siblingData) => siblingData?.type === 'internal' },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { condition: (_, siblingData) => siblingData?.type === 'external' },
    },
  ],
})

export const navItemsField: Field = {
  name: 'navItems',
  type: 'array',
  admin: { initCollapsed: true },
  fields: [{ name: 'label', type: 'text', required: true, localized: true }, linkField()],
}
