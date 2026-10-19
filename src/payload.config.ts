import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { sharpTransformer } from '@payloadcms/transformer-sharp'
import { buildConfig } from 'payload'

import { Admins } from './collections/admins'
import { Accounts, Sessions, Users, Verifications } from './collections/auth'
import { Categories } from './collections/categories'
import { Courses } from './collections/courses'
import { Folders } from './collections/folders'
import { Instructors } from './collections/instructors'
import { Lessons } from './collections/lessons'
import { Media } from './collections/media'
import { Pages } from './collections/pages'
import { Tags } from './collections/tags'
import { env } from './env'
import { Brand } from './globals/brand'
import { Footer } from './globals/footer'
import { Header } from './globals/header'
import { transport } from './lib/email/transport'
import { s3Config } from './lib/storage'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  secret: env.PAYLOAD_SECRET,
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Courses,
    Lessons,
    Categories,
    Instructors,
    Pages,
    Media,
    Folders,
    Tags,
    Admins,
    Users,
    Sessions,
    Accounts,
    Verifications,
  ],
  globals: [Header, Footer, Brand],
  editor: lexicalEditor(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL },
    idType: 'uuid',
    // Pending migrations run when the server boots in production
    prodMigrations: migrations,
    generateSchemaOutputFile: path.resolve(dirname, 'payload-generated-schema.ts'),
  }),
  localization: {
    // English is the default locale of the site; content is written in Spanish first,
    // so missing English and Catalan values fall back to Spanish.
    defaultLocale: 'en',
    fallback: true,
    locales: [
      { code: 'en', label: 'English', fallbackLocale: 'es' },
      { code: 'es', label: 'Español' },
      { code: 'ca', label: 'Català', fallbackLocale: 'es' },
    ],
  },
  email: nodemailerAdapter({
    defaultFromAddress: env.EMAIL_FROM_ADDRESS,
    defaultFromName: env.EMAIL_FROM_NAME,
    transport,
    skipVerify: true,
  }),
  storage: [
    s3Storage({
      bucket: env.S3_BUCKET,
      config: s3Config,
      // The browser uploads straight to the bucket, so large videos never pass through the server
      clientUploads: true,
      // The bucket is private: files are served by Payload at /api/media/file/<name> after the
      // collection's read access allows it (see docs/media.md)
      collections: { media: true },
    }),
  ],
  plugins: [
    seoPlugin({
      collections: ['pages', 'courses', 'lessons'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => doc?.title,
      generateDescription: ({ doc }) => doc?.summary,
    }),
  ],
  upload: {
    transformers: [
      sharpTransformer({
        collections: {
          media: {
            focalPoint: true,
            variants: [
              { name: 'thumbnail', width: 400 },
              { name: 'card', width: 768 },
              { name: 'hero', width: 1600 },
            ],
          },
        },
      }),
    ],
  },
})
