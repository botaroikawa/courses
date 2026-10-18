import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { defaultLocale, isLocale, routing } from './i18n/routing'

const intl = createIntlMiddleware(routing)

const PROTECTED_PREFIXES = ['/account']

function splitLocale(pathname: string) {
  const [, first, ...rest] = pathname.split('/')
  if (isLocale(first)) return { locale: first, path: `/${rest.join('/')}` }
  return { locale: defaultLocale, path: pathname }
}

export function proxy(request: NextRequest) {
  const { locale, path } = splitLocale(request.nextUrl.pathname)
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))

  // Optimistic check only: layouts under /account verify the session against the database
  if (isProtected && !getSessionCookie(request)) {
    const prefix = locale === defaultLocale ? '' : `/${locale}`
    const url = new URL(`${prefix}/login`, request.url)
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return intl(request)
}

export const config = {
  // Everything except Payload, APIs, Next internals and files with an extension
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
