import type { ArrayField, CollectionAfterChangeHook, CollectionConfig, Where } from 'payload'

import { isStaff, never, publishedOrStaff } from '@/access'
import { firstPublishedAtField } from '@/fields/first-published-at'
import { syncLessonCourse, validateModules } from '@/lib/course-lessons'
import { courseLevels } from '@/lib/courses'
import { coursePreview } from '@/lib/preview'
import type { Course } from '@/payload-types'

const syncLessons: CollectionAfterChangeHook<Course> = async ({ doc, req }) => {
  await syncLessonCourse(req, doc.id)
  return doc
}

const listOf = (name: string, label: string): ArrayField => ({
  name,
  label,
  type: 'array',
  localized: true,
  admin: { initCollapsed: true },
  fields: [{ name: 'text', type: 'text', required: true }],
})

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'level', '_status', 'updatedAt'],
    group: 'Courses',
    livePreview: { url: ({ data, locale }) => coursePreview(data, locale.code) },
    preview: (doc, { locale }) => coursePreview(doc, locale),
    description:
      'To retire a course without losing enrollments, unpublish it instead of deleting it. Deleting a course leaves its lessons without a course.',
  },
  access: {
    read: publishedOrStaff,
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
    afterChange: [syncLessons],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              localized: true,
              admin: { description: 'One or two sentences for course cards and search results.' },
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { like: 'image/' } },
            },
            { name: 'description', type: 'richText', localized: true },
            listOf('outcomes', "What you'll learn"),
            listOf('requirements', 'Requirements'),
          ],
        },
        {
          label: 'Syllabus',
          description:
            'Modules group lessons; drag to reorder. A lesson belongs to this course once the course is published.',
          fields: [
            {
              name: 'modules',
              type: 'array',
              labels: { singular: 'Module', plural: 'Modules' },
              validate: validateModules,
              fields: [
                { name: 'title', type: 'text', required: true, localized: true },
                {
                  name: 'lessons',
                  type: 'relationship',
                  relationTo: 'lessons',
                  hasMany: true,
                  // Lessons that are free or already here; the rest belong to another course
                  filterOptions: ({ id }): Where => ({
                    or: [
                      { course: { exists: false } },
                      ...(id ? [{ course: { equals: id } }] : []),
                    ],
                  }),
                  admin: { isSortable: true },
                },
              ],
            },
          ],
        },
      ],
    },
    { name: 'slug', type: 'slug', useAsSlug: 'title' },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: [...courseLevels],
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'instructors',
      type: 'relationship',
      relationTo: 'instructors',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Shown first in the catalogue and on the home page.',
      },
    },
    // Kept by enroll and leave, so "most popular" never counts rows
    {
      name: 'enrollmentCount',
      type: 'number',
      defaultValue: 0,
      access: { create: never, update: never },
      admin: { readOnly: true, position: 'sidebar' },
    },
    firstPublishedAtField,
  ],
}
