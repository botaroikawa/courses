import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { slugify } from 'payload/shared'

import { freePreviewOrStaff, isStaff } from '@/access'
import { contentEditor } from '@/editor'
import { firstPublishedAtField } from '@/fields/first-published-at'
import { validateLessonSlug } from '@/lib/course-lessons'
import { relationId } from '@/lib/courses'
import { lessonPreview } from '@/lib/preview'
import { countWords, readingMinutes } from '@/lib/reading-time'
import { blockFieldsOf } from '@/lib/rich-text'
import type { Lesson, VideoBlock } from '@/payload-types'

const setReadingTime: CollectionBeforeChangeHook<Lesson> = async ({ data, req }) => {
  // With locale "all" the content arrives keyed by locale
  if (data.content === undefined || req.locale === 'all') return data
  const videoIds = blockFieldsOf<VideoBlock>(data.content, 'video').flatMap(({ video }) =>
    video ? [typeof video === 'object' ? video.id : video] : [],
  )
  const { docs: videos } = videoIds.length
    ? await req.payload.find({
        collection: 'media',
        where: { id: { in: videoIds } },
        select: { duration: true },
        depth: 0,
        pagination: false,
        overrideAccess: true,
        req,
      })
    : { docs: [] }
  // A video used twice plays twice
  const seconds = videoIds.reduce(
    (total, id) => total + (videos.find((video) => video.id === id)?.duration ?? 0),
    0,
  )
  data.readingTime = readingMinutes({ words: countWords(data.content), videoSeconds: seconds })
  return data
}

// Lessons are ordered and grouped from the course's syllabus; see docs/content-model.md
export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'freePreview', '_status', 'updatedAt'],
    group: 'Courses',
    livePreview: { url: ({ data, locale, req }) => lessonPreview(data, locale.code, req) },
    preview: (doc, { locale, req }) => lessonPreview(doc, locale, req),
    description:
      'Add a lesson to a course from the course syllabus. To retire a lesson without losing student progress, unpublish it instead of deleting it.',
  },
  access: {
    read: freePreviewOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  versions: {
    drafts: {
      autosave: { interval: 1000 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [setReadingTime],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              admin: { description: 'Shown in the course syllabus and in search results.' },
            },
            { name: 'content', type: 'richText', localized: true, editor: contentEditor },
          ],
        },
      ],
    },
    // Unique within its course only, so two courses can each have an `introduction`. A text
    // field: the native slug field enforces uniqueness across the whole collection.
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Generated from the title when empty. Unique within the course.',
      },
      hooks: {
        beforeValidate: [
          ({ siblingData, value }) => slugify(value || siblingData.title || undefined) ?? value,
        ],
      },
      validate: validateLessonSlug,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Set from the course syllabus once the course is published.',
      },
      hooks: {
        // Written only by the course (src/lib/course-lessons.ts); requests cannot change it
        beforeChange: [({ previousValue }) => relationId(previousValue)],
      },
    },
    {
      name: 'freePreview',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Readable without an account, and the only lessons search engines index.',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      localized: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Minutes, computed on save from the text and the videos.',
      },
    },
    firstPublishedAtField,
  ],
}
