'use client'

import { useTheme } from 'next-themes'
import { useCallback } from 'react'

import { authClient } from '@/lib/auth-client'
import {
  isThemePreference,
  type MotionPreference,
  type ThemePreference,
} from '@/lib/preferences/options'

import { useMotionPreference } from './motion-provider'

// Reads and changes the visitor's display preferences. Changes apply immediately in this
// browser and, when signed in, are saved on the account so they follow the user around.
export function usePreferences() {
  const { motion, setMotion } = useMotionPreference()
  const { theme, setTheme } = useTheme()
  const { data: session } = authClient.useSession()

  const updateMotion = useCallback(
    async (value: MotionPreference) => {
      setMotion(value)
      if (session) await authClient.updateUser({ motionPreference: value })
    },
    [session, setMotion],
  )

  const updateTheme = useCallback(
    async (value: ThemePreference) => {
      setTheme(value)
      if (session) await authClient.updateUser({ themePreference: value })
    },
    [session, setTheme],
  )

  return {
    motion,
    theme: isThemePreference(theme) ? theme : 'system',
    updateMotion,
    updateTheme,
  }
}
