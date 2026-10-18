'use client'

import { useTranslations } from 'next-intl'
import { type FormEvent, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Link, useRouter } from '@/i18n/navigation'
import { authClient } from '@/lib/auth-client'

import { SocialButtons, type SocialProvider } from './social-buttons'
import { useLocalizedPath } from './use-localized-path'

type Status =
  | { kind: 'idle' }
  | { kind: 'pending'; action: 'password' | 'magic' }
  | { kind: 'error'; message: string }
  | { kind: 'info'; message: string }

export function LoginForm({
  providers,
  redirectTo,
}: {
  providers: SocialProvider[]
  redirectTo: string
}) {
  const t = useTranslations('login')
  const tc = useTranslations('common')
  const router = useRouter()
  const localized = useLocalizedPath()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const callbackURL = localized(redirectTo)

  const signInWithPassword = async (event: FormEvent) => {
    event.preventDefault()
    setStatus({ kind: 'pending', action: 'password' })
    const { error } = await authClient.signIn.email({ email, password, callbackURL })
    if (!error) {
      router.push(redirectTo)
      router.refresh()
      return
    }
    setStatus(
      error.status === 403
        ? { kind: 'info', message: t('emailNotVerified') }
        : { kind: 'error', message: error.message ?? tc('genericError') },
    )
  }

  const sendMagicLink = async () => {
    setStatus({ kind: 'pending', action: 'magic' })
    const { error } = await authClient.signIn.magicLink({ email, callbackURL })
    setStatus(
      error
        ? { kind: 'error', message: error.message ?? tc('genericError') }
        : { kind: 'info', message: t('magicLinkSent') },
    )
  }

  const pending = status.kind === 'pending'

  return (
    <div className="flex flex-col gap-6">
      <SocialButtons providers={providers} callbackURL={callbackURL} />
      {providers.length > 0 && <FieldSeparator>{tc('or')}</FieldSeparator>}
      <form onSubmit={signInWithPassword}>
        <FieldGroup>
          {(status.kind === 'error' || status.kind === 'info') && (
            <Alert variant={status.kind === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
              <Link href="/forgot-password" className="text-muted-foreground text-sm underline">
                {t('forgotPassword')}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={pending || !password}>
              {pending && status.action === 'password' && <Spinner data-icon="inline-start" />}
              {t('submit')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending || !email}
              onClick={sendMagicLink}
            >
              {pending && status.action === 'magic' && <Spinner data-icon="inline-start" />}
              {t('magicLink')}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <p className="text-center text-muted-foreground text-sm">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-foreground underline">
          {t('register')}
        </Link>
      </p>
    </div>
  )
}
