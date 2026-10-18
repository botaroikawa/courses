'use client'

import { useTranslations } from 'next-intl'
import { type FormEvent, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Link } from '@/i18n/navigation'
import { authClient } from '@/lib/auth-client'

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations('resetPassword')
  const tr = useTranslations('register')
  const tc = useTranslations('common')
  const tf = useTranslations('forgotPassword')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle')

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t('invalidToken')}{' '}
          <Link href="/forgot-password" className="underline">
            {tf('submit')}
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'done') {
    return (
      <Alert>
        <AlertDescription>
          {t('done')}{' '}
          <Link href="/login" className="underline">
            {tc('signIn')}
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('pending')
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setStatus(error ? 'error' : 'done')
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>{t('invalidToken')}</AlertDescription>
          </Alert>
        )}
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
          <FieldDescription>{tr('passwordHint')}</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={status === 'pending'}>
            {status === 'pending' && <Spinner data-icon="inline-start" />}
            {t('submit')}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
