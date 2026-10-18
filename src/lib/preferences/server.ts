import 'server-only'

import { cookies } from 'next/headers'

import { isMotionPreference, MOTION_COOKIE, type MotionPreference } from './options'

export async function getMotionPreference(): Promise<MotionPreference> {
  const value = (await cookies()).get(MOTION_COOKIE)?.value
  return isMotionPreference(value) ? value : 'system'
}
