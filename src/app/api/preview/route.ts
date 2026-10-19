import { cookies, draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { defaultLocale, isLocale } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/content'

const ONE_YEAR = 60 * 60 * 24 * 365

// Opened by Payload's preview button and Live Preview iframe. Only signed-in admins may
// enable draft mode; the admin session cookie is shared because both live on the same origin.
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')
  if (!path?.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid path', { status: 400 })
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Unauthorized', { status: 401 })

  ;(await draftMode()).enable()
  // English paths carry no prefix, so the visitor's language cookie would redirect them to their
  // own language: preview the locale being edited instead
  const first = path.split('/')[1]
  ;(await cookies()).set('NEXT_LOCALE', isLocale(first) ? first : defaultLocale, {
    path: '/',
    sameSite: 'lax',
    maxAge: ONE_YEAR,
  })
  redirect(path)
}
