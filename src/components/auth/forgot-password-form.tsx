'use client'

import { useTranslations } from 'next-intl'
import { type FormEvent, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Link } from '@/i18n/navigation'
import { authClient } from '@/lib/auth-client'

import { useLocalizedPath } from './use-localized-path'

export function ForgotPasswordForm() {
  const t = useTranslations('forgotPassword')
  const tc = useTranslations('common')
  const localized = useLocalizedPath()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'error'>('idle')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('pending')
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: localized('/reset-password'),
    })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        {status === 'sent' && (
          <Alert>
            <AlertDescription>{t('sent')}</AlertDescription>
          </Alert>
        )}
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>{tc('genericError')}</AlertDescription>
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
          <Button type="submit" disabled={status === 'pending'}>
            {status === 'pending' && <Spinner data-icon="inline-start" />}
            {t('submit')}
          </Button>
          <Link href="/login" className="text-center text-muted-foreground text-sm underline">
            {t('back')}
          </Link>
        </Field>
      </FieldGroup>
    </form>
  )
}
