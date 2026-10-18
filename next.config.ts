import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
  ? new URL(process.env.NEXT_PUBLIC_MEDIA_URL)
  : null

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: mediaUrl
      ? [
          {
            protocol: mediaUrl.protocol.replace(':', '') as 'http' | 'https',
            hostname: mediaUrl.hostname,
            port: mediaUrl.port,
            pathname: `${mediaUrl.pathname.replace(/\/$/, '')}/**`,
          },
        ]
      : [],
    // SeaweedFS runs on localhost in development
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
