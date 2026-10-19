import { getLocale, getTranslations } from 'next-intl/server'

import { getMediaByIds, mediaOf } from '@/lib/content'
import type { VideoBlock } from '@/payload-types'

import { Figure } from '../figure'

export async function Video({ video, caption }: VideoBlock) {
  const media = mediaOf(video)
  if (!media?.url) return null
  const [t, locale] = await Promise.all([getTranslations('content'), getLocale()])
  // The block populates the video one level deep, so its subtitle files arrive as ids
  const subtitleIds = (media.subtitles ?? []).map(({ file }) =>
    typeof file === 'object' ? file.id : file,
  )
  const files = await getMediaByIds(subtitleIds)
  const languageName = new Intl.DisplayNames([locale], { type: 'language' })
  const tracks = (media.subtitles ?? []).flatMap(({ locale: trackLocale, file }) => {
    const id = typeof file === 'object' ? file.id : file
    const url = files.find((doc) => doc.id === id)?.url
    return url ? [{ locale: trackLocale, url }] : []
  })

  return (
    <Figure caption={caption}>
      {/* biome-ignore lint/a11y/useMediaCaption: subtitles are optional per video */}
      <video
        controls
        playsInline
        preload="metadata"
        src={media.url}
        className="aspect-video w-full rounded-lg bg-black"
      >
        {tracks.map((track) => (
          <track
            key={track.locale}
            kind="subtitles"
            src={track.url}
            srcLang={track.locale}
            label={languageName.of(track.locale)}
          />
        ))}
        {t('videoUnsupported')}
      </video>
    </Figure>
  )
}
