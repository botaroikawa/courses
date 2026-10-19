import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { createFolderField, createTagField } from 'payload'

import { isStaff, publicOrStaff } from '@/access'
import { locales } from '@/i18n/routing'
import { cacheControlFor, isImage, isVideo, mediaVisibilities, storageKey } from '@/lib/media'
import { readVideoDuration } from '@/lib/storage'
import type { Media as MediaDoc } from '@/payload-types'

// Reads the duration of a newly uploaded video from the bucket; it feeds lesson reading time
const setVideoDuration: CollectionAfterChangeHook<MediaDoc> = async ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  if (context.skipVideoDuration || !isVideo(doc.mimeType) || !doc.filename) return doc
  if (doc.filename === previousDoc?.filename && typeof doc.duration === 'number') return doc

  let duration: number | null = null
  try {
    // `_objectKey` is hidden, so it is not on `doc`
    const stored = await req.payload.findByID({
      collection: 'media',
      id: doc.id,
      select: { filename: true, prefix: true, _objectKey: true },
      showHiddenFields: true,
      overrideAccess: true,
      req,
    })
    duration = await readVideoDuration(
      storageKey({
        filename: doc.filename,
        objectKey: (stored as { _objectKey?: string | null })._objectKey,
        prefix: stored.prefix,
      }),
    )
  } catch (err) {
    req.payload.logger.error({ err, msg: `Could not read the duration of ${doc.filename}` })
  }
  if (duration === (doc.duration ?? null)) return doc

  await req.payload.update({
    collection: 'media',
    id: doc.id,
    data: { duration },
    context: { skipVideoDuration: true },
    overrideAccess: true,
    req,
  })
  return { ...doc, duration }
}

// Every file lives in one private bucket and is served through Payload, which checks read access
// first. Protection is per file (`visibility`), never a separate bucket. See docs/media.md.
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'visibility', 'updatedAt'],
  },
  access: {
    read: publicOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterChange: [setVideoDuration],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      validate: (value: string | null | undefined, { data }: { data: Partial<MediaDoc> }) =>
        isImage(data?.mimeType) && !value?.trim() ? 'Images need alternative text.' : true,
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'public',
      options: [...mediaVisibilities],
      admin: {
        position: 'sidebar',
        description: 'Private files can only be opened by staff.',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Seconds, read from the file.',
        condition: (data) => isVideo(data?.mimeType),
      },
    },
    {
      name: 'subtitles',
      type: 'array',
      admin: {
        condition: (data) => isVideo(data?.mimeType),
        description: 'WebVTT (.vtt) files, at most one per language.',
      },
      validate: (rows: unknown) => {
        if (!Array.isArray(rows)) return true
        const used = rows.map((row: { locale?: string }) => row.locale)
        return new Set(used).size === used.length ? true : 'Each language can only have one track.'
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'locale',
              type: 'select',
              required: true,
              options: [...locales],
            },
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: { mimeType: { equals: 'text/vtt' } },
            },
          ],
        },
      ],
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  // Image variants are configured on the sharp transformer in payload.config.ts
  upload: {
    // MP4 is the video format every browser plays natively, and the one whose duration we read
    mimeTypes: ['image/*', 'video/mp4', 'text/vtt'],
    // Runs before the storage adapter streams the file, which keeps these headers
    handlers: [
      (_req, { doc, headers }) => {
        headers?.set('Cache-Control', cacheControlFor((doc as Partial<MediaDoc>)?.visibility))
      },
    ],
    // Responses built without the handler above (e.g. transformed images) stay out of shared caches
    modifyResponseHeaders: ({ headers }) => {
      if (!headers.has('Cache-Control')) headers.set('Cache-Control', cacheControlFor(null))
      return headers
    },
  },
}
