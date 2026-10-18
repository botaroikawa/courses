import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Providers } from '@/components/preferences/providers'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { env } from '@/env'
import { routing } from '@/i18n/routing'
import { getSiteGlobals, mediaOf } from '@/lib/content'
import { getMotionPreference } from '@/lib/preferences/server'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const { brand } = await getSiteGlobals(locale)
  const favicon = mediaOf(brand.favicon)?.url
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: brand.siteName, template: `%s | ${brand.siteName}` },
    description: brand.tagline ?? undefined,
    icons: favicon ? { icon: favicon } : undefined,
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [motion, t] = await Promise.all([getMotionPreference(), getTranslations('common')])

  return (
    <html lang={locale} data-motion={motion} className={sans.variable} suppressHydrationWarning>
      <body className="flex min-h-svh flex-col">
        <NextIntlClientProvider>
          <Providers motion={motion}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
            >
              {t('skipToContent')}
            </a>
            <SiteHeader locale={locale} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter locale={locale} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
