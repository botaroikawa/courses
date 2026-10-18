'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

export type SocialProvider = 'google' | 'github'

export function SocialButtons({
  providers,
  callbackURL,
}: {
  providers: SocialProvider[]
  callbackURL: string
}) {
  const t = useTranslations('login')
  const [pending, setPending] = useState<SocialProvider | null>(null)

  if (providers.length === 0) return null

  const signIn = async (provider: SocialProvider) => {
    setPending(provider)
    const { error } = await authClient.signIn.social({ provider, callbackURL })
    // On success the browser is already navigating to the provider
    if (error) setPending(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {providers.map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          disabled={pending !== null}
          onClick={() => signIn(provider)}
        >
          {pending === provider && <Spinner data-icon="inline-start" />}
          {t(provider)}
        </Button>
      ))}
    </div>
  )
}
