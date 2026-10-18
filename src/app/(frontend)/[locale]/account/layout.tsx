import type { ReactNode } from 'react'

import { redirect } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getSession } from '@/lib/session'

export default async function AccountLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const [{ locale }, session] = await Promise.all([params, getSession()])
  if (!session)
    redirect({
      href: { pathname: '/login', query: { redirect: '/account' } },
      locale: locale as Locale,
    })

  return <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">{children}</div>
}
