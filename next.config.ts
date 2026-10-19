import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Payload serves uploads from its own origin, at absolute URLs built from the site URL
const mediaFiles = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL('/api/media/file/**', process.env.NEXT_PUBLIC_SITE_URL)
  : null

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: mediaFiles ? [mediaFiles] : [],
    // The site itself runs on localhost in development
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
