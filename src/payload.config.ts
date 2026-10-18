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
import { Folders } from './collections/folders'
import { Media } from './collections/media'
import { Pages } from './collections/pages'
import { Tags } from './collections/tags'
import { env } from './env'
import { Brand } from './globals/brand'
import { Footer } from './globals/footer'
import { Header } from './globals/header'
import { transport } from './lib/email/transport'
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
  collections: [Pages, Media, Folders, Tags, Admins, Users, Sessions, Accounts, Verifications],
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
      config: {
        endpoint: env.S3_ENDPOINT,
        region: env.S3_REGION,
        forcePathStyle: true,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        },
      },
      collections: {
        media: {
          // Files are served straight from the public bucket / CDN, not through Payload
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            [env.NEXT_PUBLIC_MEDIA_URL, prefix, filename].filter(Boolean).join('/'),
        },
      },
    }),
  ],
  plugins: [
    seoPlugin({
      collections: ['pages'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => doc?.title,
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
