import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { type LinkHrefs, resolveLink } from '@/lib/links'
import type { LinkBlock as LinkBlockFields } from '@/payload-types'

export function LinkBlock({ label, link, hrefs }: LinkBlockFields & { hrefs: LinkHrefs }) {
  const resolved = resolveLink(link, hrefs)
  // The target is not published in this language
  if (!resolved) return null
  const target = resolved.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  const anchor =
    resolved.kind === 'internal' ? (
      <Link href={resolved.href} {...target} />
    ) : (
      <a href={resolved.href} {...target} />
    )

  return (
    <p className="mt-6 first:mt-0">
      {link.appearance === 'button' ? (
        <Button
          nativeButton={false}
          render={anchor}
          variant={link.variant ?? 'default'}
          size={link.size ?? 'default'}
        >
          {label}
        </Button>
      ) : (
        <Button nativeButton={false} render={anchor} variant="link" className="h-auto px-0">
          {label}
        </Button>
      )}
    </p>
  )
}
