'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useMounted } from '@/hooks/use-mounted'
import { usePathname, useRouter } from '@/i18n/navigation'
import { isLocale, type Locale, locales } from '@/i18n/routing'
import { authClient } from '@/lib/auth-client'
import {
  isMotionPreference,
  isThemePreference,
  motionPreferences,
  themePreferences,
} from '@/lib/preferences/options'

import { usePreferences } from './use-preferences'

const localeLabels: Record<Locale, string> = { en: 'English', es: 'Español', ca: 'Català' }

const themeKeys = {
  system: 'themeSystem',
  light: 'themeLight',
  dark: 'themeDark',
} as const

const motionKeys = {
  system: 'motionSystem',
  reduce: 'motionReduce',
  full: 'motionFull',
} as const

// Base UI toggle groups report an array; these allow exactly one selected value
function single<T extends string>(guard: (v: unknown) => v is T, onChange: (v: T) => void) {
  return (values: unknown[]) => {
    const [value] = values
    if (guard(value)) onChange(value)
  }
}

export function PreferenceControls({ size = 'default' }: { size?: 'sm' | 'default' }) {
  const t = useTranslations('preferences')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const { data: session } = authClient.useSession()
  const { motion, theme, updateMotion, updateTheme } = usePreferences()
  const mounted = useMounted()

  const changeLocale = (next: Locale) => {
    if (session) void authClient.updateUser({ locale: next })
    startTransition(() => router.replace(pathname, { locale: next }))
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>{t('language')}</FieldLabel>
        <ToggleGroup
          variant="outline"
          size={size}
          value={[locale]}
          onValueChange={single(isLocale, changeLocale)}
        >
          {locales.map((code) => (
            <ToggleGroupItem key={code} value={code} lang={code}>
              {localeLabels[code]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      <Field>
        <FieldLabel>{t('theme')}</FieldLabel>
        <ToggleGroup
          variant="outline"
          size={size}
          // next-themes reads the stored theme in the browser only
          value={mounted ? [theme] : []}
          onValueChange={single(isThemePreference, updateTheme)}
        >
          {themePreferences.map((value) => (
            <ToggleGroupItem key={value} value={value}>
              {t(themeKeys[value])}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      <Field>
        <FieldLabel>{t('motion')}</FieldLabel>
        <ToggleGroup
          variant="outline"
          size={size}
          value={[motion]}
          onValueChange={single(isMotionPreference, updateMotion)}
        >
          {motionPreferences.map((value) => (
            <ToggleGroupItem key={value} value={value}>
              {t(motionKeys[value])}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription>{t('motionDescription')}</FieldDescription>
      </Field>
    </FieldGroup>
  )
}
