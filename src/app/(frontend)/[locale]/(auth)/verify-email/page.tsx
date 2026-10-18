import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('verifyEmail')
  return { title: t('title'), robots: { index: false } }
}

export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const t = await getTranslations('verifyEmail')

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{t('title')}</h1>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
    </Card>
  )
}
