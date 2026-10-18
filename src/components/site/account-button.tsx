'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { authClient } from '@/lib/auth-client'

export function AccountButton() {
  const t = useTranslations('common')
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return null

  return session ? (
    <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/account" />}>
      {t('account')}
    </Button>
  ) : (
    <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
      {t('signIn')}
    </Button>
  )
}
