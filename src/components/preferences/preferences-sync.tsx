'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { authClient } from '@/lib/auth-client'
import { isMotionPreference, isThemePreference } from '@/lib/preferences/options'

import { useMotionPreference } from './motion-provider'

// When a user signs in, the preferences saved on their account win over this browser's
export function PreferencesSync() {
  const { data: session } = authClient.useSession()
  const { setMotion } = useMotionPreference()
  const { setTheme } = useTheme()
  const syncedFor = useRef<string | null>(null)

  useEffect(() => {
    const user = session?.user
    if (!user || syncedFor.current === user.id) return
    syncedFor.current = user.id
    if (isMotionPreference(user.motionPreference)) setMotion(user.motionPreference)
    if (isThemePreference(user.themePreference)) setTheme(user.themePreference)
  }, [session, setMotion, setTheme])

  return null
}
