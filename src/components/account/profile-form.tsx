'use client'

import { useTranslations } from 'next-intl'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

export function ProfileForm({ name: initialName, email }: { name: string; email: string }) {
  const t = useTranslations('account')
  const tc = useTranslations('common')
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState<'idle' | 'pending' | 'saved' | 'error'>('idle')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('pending')
    const { error } = await authClient.updateUser({ name })
    setStatus(error ? 'error' : 'saved')
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setStatus('idle')
            }}
          />
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
          <Input id="email" type="email" value={email} disabled readOnly />
        </Field>
        <Field orientation="horizontal">
          <Button type="submit" disabled={status === 'pending'}>
            {status === 'pending' && <Spinner data-icon="inline-start" />}
            {t('save')}
          </Button>
          <FieldDescription aria-live="polite">
            {status === 'saved' && t('saved')}
            {status === 'error' && tc('genericError')}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
