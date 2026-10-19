'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Media } from '@/payload-types'

// Click to see the image at full size. The optimizer fetches without a session, so only
// public files go through it (docs/media.md).
export function ZoomableImage({ media }: { media: Media }) {
  const t = useTranslations('content')
  if (!media.url) return null
  const alt = media.alt ?? ''
  const unoptimized = media.visibility !== 'public'

  return (
    <Dialog>
      <DialogTrigger
        aria-label={alt ? t('enlargeImageNamed', { alt }) : t('enlargeImage')}
        className="block w-full cursor-zoom-in overflow-hidden rounded-lg"
      >
        <Image
          src={media.url}
          alt={alt}
          width={media.width ?? 1200}
          height={media.height ?? 800}
          sizes="(min-width: 768px) 768px, 100vw"
          unoptimized={unoptimized}
          className="h-auto w-full"
        />
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] w-auto max-w-[95vw] p-2 sm:max-w-[95vw]">
        <DialogTitle className="sr-only">{alt || t('image')}</DialogTitle>
        <Image
          src={media.url}
          alt={alt}
          width={media.width ?? 1600}
          height={media.height ?? 1000}
          sizes="95vw"
          unoptimized={unoptimized}
          className="h-auto max-h-[calc(95vh-1rem)] w-auto rounded-md object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
