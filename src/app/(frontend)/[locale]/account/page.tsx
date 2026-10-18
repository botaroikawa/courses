import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProfileForm } from '@/components/account/profile-form'
import { SignOutButton } from '@/components/account/sign-out-button'
import { PreferenceControls } from '@/components/preferences/preference-controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/routing'
import { getSession } from '@/lib/session'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account')
  return { title: t('title'), robots: { index: false } }
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const [t, tp, session] = await Promise.all([
    getTranslations('account'),
    getTranslations('preferences'),
    getSession(),
  ])
  // The layout already redirected anonymous visitors
  if (!session) return null

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-3xl tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <SignOutButton />
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t('profile')}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={session.user.name} email={session.user.email} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{tp('title')}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PreferenceControls />
        </CardContent>
      </Card>
    </>
  )
}
