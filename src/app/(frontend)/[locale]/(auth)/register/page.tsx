import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { RegisterForm } from '@/components/auth/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/routing'
import { enabledSocialProviders } from '@/lib/auth'
import { safeRedirect, stripLocale } from '@/lib/redirects'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('register')
  return { title: t('title'), robots: { index: false } }
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ redirect?: string }>
}

export default async function RegisterPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const [t, { redirect }] = await Promise.all([getTranslations('register'), searchParams])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{t('title')}</h1>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm
          providers={enabledSocialProviders}
          redirectTo={stripLocale(safeRedirect(redirect), locale)}
        />
      </CardContent>
    </Card>
  )
}
