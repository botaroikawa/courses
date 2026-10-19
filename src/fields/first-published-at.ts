import type { Field } from 'payload'

// Date a document was first published in a locale. Drives the "New" badge and the "newest" sort.
// Always taken from the stored document, so no request can set or move it.
export const firstPublishedAtField: Field = {
  name: 'firstPublishedAt',
  type: 'date',
  localized: true,
  index: true,
  admin: {
    readOnly: true,
    position: 'sidebar',
    date: { pickerAppearance: 'dayAndTime' },
  },
  hooks: {
    beforeChange: [
      ({ req, siblingData, siblingDocWithLocales }) => {
        // Read per locale: the localized original falls back to Spanish
        const stored = (siblingDocWithLocales?.firstPublishedAt as Record<string, unknown>)?.[
          req.locale ?? ''
        ]
        if (stored) return stored
        return siblingData._status === 'published' ? new Date().toISOString() : null
      },
    ],
  },
}
