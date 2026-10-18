import Image from 'next/image'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getSiteGlobals, mediaOf } from '@/lib/content'
import { resolveLink } from '@/lib/links'

import { AccountButton } from './account-button'
import { NavLink } from './nav-link'

export async function SiteHeader({ locale }: { locale: Locale }) {
  const { header, brand } = await getSiteGlobals(locale)
  const logo = mediaOf(brand.logo)
  const logoDark = mediaOf(brand.logoDark)

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {logo?.url ? (
            <>
              <Image
                src={logo.url}
                alt={logo.alt}
                width={logo.width ?? 32}
                height={logo.height ?? 32}
                className={logoDark?.url ? 'h-8 w-auto dark:hidden' : 'h-8 w-auto'}
              />
              {logoDark?.url && (
                <Image
                  src={logoDark.url}
                  alt={logoDark.alt}
                  width={logoDark.width ?? 32}
                  height={logoDark.height ?? 32}
                  className="hidden h-8 w-auto dark:block"
                />
              )}
            </>
          ) : (
            brand.siteName
          )}
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm">
          {header.navItems?.map((item) => {
            const link = resolveLink(item.link)
            if (!link) return null
            return (
              <NavLink
                key={item.id}
                link={link}
                className="text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <AccountButton />
      </div>
    </header>
  )
}
