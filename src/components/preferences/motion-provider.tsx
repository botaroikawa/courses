'use client'

import { MotionConfig } from 'motion/react'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

import { MOTION_COOKIE, type MotionPreference } from '@/lib/preferences/options'

const ONE_YEAR = 60 * 60 * 24 * 365

// How each preference maps onto Motion's `reducedMotion` setting
const reducedMotion = {
  system: 'user',
  reduce: 'always',
  full: 'never',
} as const satisfies Record<MotionPreference, 'user' | 'always' | 'never'>

type MotionPreferenceContext = {
  motion: MotionPreference
  setMotion: (value: MotionPreference) => void
}

const Context = createContext<MotionPreferenceContext | null>(null)

export function MotionProvider({
  initial,
  children,
}: {
  initial: MotionPreference
  children: ReactNode
}) {
  const [motion, setMotionState] = useState(initial)

  const setMotion = useCallback((value: MotionPreference) => {
    setMotionState(value)
    // Same attribute the server renders, so CSS reacts instantly without a reload
    document.documentElement.dataset.motion = value
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available everywhere yet
    document.cookie = `${MOTION_COOKIE}=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax`
  }, [])

  return (
    <Context.Provider value={{ motion, setMotion }}>
      <MotionConfig reducedMotion={reducedMotion[motion]}>{children}</MotionConfig>
    </Context.Provider>
  )
}

export function useMotionPreference() {
  const context = useContext(Context)
  if (!context) throw new Error('useMotionPreference must be used inside <MotionProvider>')
  return context
}
