# Media

One `media` collection and one bucket hold every file: images, videos, subtitles and, later, downloads. Protection is a per-file rule, never a separate bucket or collection.

**Status:** built (2026-10-19), except the paid-access level.

## Serving and visibility

- The bucket is private. Payload serves every file at `/api/media/file/<name>` after the collection's read access (`publicOrStaff` in `src/access`) allows it; nothing reads the bucket directly.
- `visibility` on each file:
  - `public` (default): anyone. Sent with `Cache-Control: public, max-age=86400`, so browsers and the CDN answer repeat requests. The default keeps free-preview lessons from shipping broken images when someone forgets to mark them.
  - `private`: staff only, for example material for a course that is not out yet. Sent with `private, no-store`, so a shared cache never keeps a copy fetched by staff.
- The `Cache-Control` header is set by an upload handler that runs before the storage adapter streams the file; any response built without it falls back to `private, no-store`. Switching a file from public to private takes up to a day to leave caches that already hold it.
- Lessons and pages store a file's id, never its URL, so changing how files are served touches no content.
- Lesson content is read on the server past access control ([site.md](site.md#reading-content)), so the rich-text renderer drops private images and videos unless staff are previewing.
- URLs are absolute (`NEXT_PUBLIC_SITE_URL` + `/api/media/file/…`); `next.config.ts` allows exactly that path for `next/image`. The image optimizer fetches without a session, so it only sees public files.
- Objects live at `[prefix/]<_objectKey>/<filename>`, where `_objectKey` is a hidden per-upload folder assigned by the storage plugin (`storageKey` in `src/lib/media.ts`).

## Accepted files

Images, MP4 video and WebVTT subtitles (`upload.mimeTypes`). Alt text is required for images only. Accepting another type means checking how it plays in the browser and, for video, how its duration is read.

## Video

- Uploaded from the browser straight to the bucket (`clientUploads`), so large files never pass through the server. The bucket needs a CORS rule allowing `PUT` from the site origin (SeaweedFS allows it by default locally).
- MP4 only: the format every browser plays natively with `<video>`.
- `duration` (seconds, read-only) is read after upload from the file's `mvhd` box with ranged reads (`src/lib/mp4.ts`); the video is never downloaded in full. It feeds lesson reading time. A failed read is logged and leaves it empty.
- `subtitles`: optional `.vtt` tracks, at most one per locale, each a `media` file of its own.
- Range requests are supported, so seeking works.

## Paid access (planned)

A third visibility level for files that only students with access to a course may see. Payload checks access and redirects to a short-lived signed URL (`signedDownloads` in the S3 adapter), so R2 serves the bytes, including video range requests. How a file is tied to a course (marked by hand or derived from the lessons that use it) is decided then. Students authenticate with Better Auth, not Payload, so that access check will need to read the Better Auth session.

## Local development

SeaweedFS holds the `media` bucket with no anonymous access (`docker/seaweedfs/s3.json`). Inspect it with the AWS CLI against `http://localhost:8333` using the keys in `.env.example`.
