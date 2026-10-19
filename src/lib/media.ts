// Who may fetch a file. Every file is served by Payload from a private bucket (see docs/media.md)
export const mediaVisibilities = [
  { label: 'Public', value: 'public' },
  { label: 'Private (staff only)', value: 'private' },
] as const
export type MediaVisibility = (typeof mediaVisibilities)[number]['value']

// Public files may be kept by browsers and the CDN for a day; anything else must never reach a
// shared cache, or a private file fetched by staff could be served to everyone
export function cacheControlFor(visibility: unknown): string {
  return visibility === 'public' ? 'public, max-age=86400' : 'private, no-store'
}

export const isImage = (mimeType: unknown) =>
  typeof mimeType === 'string' && mimeType.startsWith('image/')

export const isVideo = (mimeType: unknown) =>
  typeof mimeType === 'string' && mimeType.startsWith('video/')

// Object key of an uploaded file inside the bucket: `[prefix/][objectKey/]filename`, where
// `_objectKey` is the hidden per-upload folder the storage plugin assigns
export function storageKey({
  filename,
  objectKey,
  prefix,
}: {
  filename: string
  objectKey?: string | null
  prefix?: string | null
}) {
  return [prefix, objectKey, filename]
    .map((segment) => segment?.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')
}
