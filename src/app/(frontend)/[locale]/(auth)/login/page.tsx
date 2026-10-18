import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/routing'
import { enabledSocialProviders } from '@/lib/auth'
import { safeRedirect } from '@/lib/redirects'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ redirect?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('login')
  return { title: t('title'), robots: { index: false } }
}

export default async function LoginPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const [t, { redirect }] = await Promise.all([getTranslations('login'), searchParams])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{t('title')}</h1>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm
          providers={enabledSocialProviders}
          redirectTo={stripLocale(safeRedirect(redirect), locale)}
        />
      </CardContent>
    </Card>
  )
}

// The proxy passes the full localized path; navigation helpers expect it without the prefix
function stripLocale(path: string, locale: Locale) {
  return path === `/${locale}` ? '/' : path.replace(new RegExp(`^/${locale}(?=/)`), '')
}
