import { cn } from 'cn'
import type { ReactNode } from 'react'

// Images, videos, charts and plots share one frame and caption style
export function Figure({
  caption,
  className,
  children,
}: {
  caption?: string | null
  className?: string
  children: ReactNode
}) {
  return (
    <figure className={cn('mt-8 mb-8 first:mt-0', className)}>
      {children}
      {caption && (
        <figcaption className="mt-2 text-center text-muted-foreground text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
