'use client'

import { useLocale, useTranslations } from 'next-intl'
import { type FormEvent, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Link, useRouter } from '@/i18n/navigation'
import { authClient } from '@/lib/auth-client'

import { SocialButtons, type SocialProvider } from './social-buttons'
import { useLocalizedPath } from './use-localized-path'

export function RegisterForm({
  providers,
  redirectTo,
}: {
  providers: SocialProvider[]
  // Where the email confirmation or social sign-up lands, locale-less
  redirectTo: string
}) {
  const t = useTranslations('register')
  const tc = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const localized = useLocalizedPath()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      locale,
      callbackURL: localized(redirectTo),
    })
    if (error) {
      setError(error.message ?? tc('genericError'))
      setPending(false)
      return
    }
    router.push('/verify-email')
  }

  return (
    <div className="flex flex-col gap-6">
      <SocialButtons providers={providers} callbackURL={localized(redirectTo)} />
      {providers.length > 0 && <FieldSeparator>{tc('or')}</FieldSeparator>}
      <form onSubmit={submit}>
        <FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
            <Input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
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
            <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FieldDescription>{t('passwordHint')}</FieldDescription>
          </Field>
          <Field>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {t('submit')}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <p className="text-center text-muted-foreground text-sm">
        {t('haveAccount')}{' '}
        <Link
          href={{ pathname: '/login', query: { redirect: localized(redirectTo) } }}
          className="text-foreground underline"
        >
          {t('signIn')}
        </Link>
      </p>
    </div>
  )
}
