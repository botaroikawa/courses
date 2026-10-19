import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3'

import { env } from '@/env'
import { readMp4Duration } from '@/lib/mp4'

// Shared by the Payload storage adapter and by code that reads objects directly
export const s3Config: S3ClientConfig = {
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
}

let client: S3Client | undefined
const getClient = () => {
  client ??= new S3Client(s3Config)
  return client
}

// Duration in whole seconds of an MP4 object. Uses ranged reads, so a large video is never
// downloaded in full.
export async function readVideoDuration(key: string): Promise<number | null> {
  const s3 = getClient()
  const head = await s3.send(new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: key }))
  if (!head.ContentLength) return null

  const duration = await readMp4Duration(async (start, length) => {
    const object = await s3.send(
      new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Range: `bytes=${start}-${start + length - 1}`,
      }),
    )
    return object.Body ? object.Body.transformToByteArray() : new Uint8Array()
  }, head.ContentLength)
  return duration === null ? null : Math.round(duration)
}
