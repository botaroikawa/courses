'use client'

import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

import type { MotionPreference } from '@/lib/preferences/options'

import { MotionProvider } from './motion-provider'
import { PreferencesSync } from './preferences-sync'

export function Providers({ motion, children }: { motion: MotionPreference; children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      // The anti-flash script only matters in the server HTML. Re-rendered on the client (e.g.
      // after switching locale) React 19 warns about <script>; a non-JS type silences it.
      scriptProps={typeof window === 'undefined' ? undefined : { type: 'application/json' }}
    >
      <MotionProvider initial={motion}>
        <PreferencesSync />
        {children}
      </MotionProvider>
    </ThemeProvider>
  )
}
