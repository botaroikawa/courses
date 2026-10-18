'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from '@/i18n/navigation'
import { authClient } from '@/lib/auth-client'

export function SignOutButton() {
  const t = useTranslations('common')
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const signOut = async () => {
    setPending(true)
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={signOut} disabled={pending}>
      {pending && <Spinner data-icon="inline-start" />}
      {t('signOut')}
    </Button>
  )
}
