export const motionPreferences = ['system', 'reduce', 'full'] as const
export type MotionPreference = (typeof motionPreferences)[number]

export const themePreferences = ['system', 'light', 'dark'] as const
export type ThemePreference = (typeof themePreferences)[number]

export const MOTION_COOKIE = 'ok-motion'

export function isMotionPreference(value: unknown): value is MotionPreference {
  return typeof value === 'string' && (motionPreferences as readonly string[]).includes(value)
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (themePreferences as readonly string[]).includes(value)
}
