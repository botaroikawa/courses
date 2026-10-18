import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import type { ResolvedLink } from '@/lib/links'

export function NavLink({
  link,
  className,
  children,
}: {
  link: ResolvedLink
  className?: string
  children: ReactNode
}) {
  const target = link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  if (link.kind === 'external') {
    return (
      <a href={link.href} className={className} {...target}>
        {children}
      </a>
    )
  }
  return (
    <Link href={link.href} className={className} {...target}>
      {children}
    </Link>
  )
}
