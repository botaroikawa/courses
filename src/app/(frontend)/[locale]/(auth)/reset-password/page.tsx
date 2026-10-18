import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
  // Better Auth appends ?token=… on success or ?error=INVALID_TOKEN on failure
  searchParams: Promise<{ token?: string; error?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('resetPassword')
  return { title: t('title'), robots: { index: false } }
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const [t, { token, error }] = await Promise.all([getTranslations('resetPassword'), searchParams])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{t('title')}</h1>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={!error && token ? token : null} />
      </CardContent>
    </Card>
  )
}
