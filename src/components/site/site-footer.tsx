import { getTranslations } from 'next-intl/server'

import { PreferenceControls } from '@/components/preferences/preference-controls'
import { Separator } from '@/components/ui/separator'
import type { Locale } from '@/i18n/routing'
import { getSiteGlobals } from '@/lib/content'
import { resolveLink } from '@/lib/links'

import { NavLink } from './nav-link'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [{ footer, brand }, t] = await Promise.all([
    getSiteGlobals(locale),
    getTranslations('preferences'),
  ])

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3">
            <p className="font-semibold">{brand.siteName}</p>
            {brand.tagline && <p className="text-muted-foreground text-sm">{brand.tagline}</p>}
            <nav className="flex flex-wrap gap-4 text-sm">
              {footer.navItems?.map((item) => {
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
          </div>
          <section aria-label={t('title')} className="md:w-sm md:shrink-0">
            <PreferenceControls size="sm" />
          </section>
        </div>
        <Separator />
        {footer.copyright && <p className="text-muted-foreground text-xs">{footer.copyright}</p>}
      </div>
    </footer>
  )
}
