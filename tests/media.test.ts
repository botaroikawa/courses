import { describe, expect, it } from 'vitest'

import { cacheControlFor, storageKey } from '@/lib/media'
import { type ReadRange, readMp4Duration } from '@/lib/mp4'

function box(type: string, body: Uint8Array, { large = false } = {}): Uint8Array {
  const headerSize = large ? 16 : 8
  const bytes = new Uint8Array(headerSize + body.length)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, large ? 1 : bytes.length)
  bytes.set(
    [...type].map((char) => char.charCodeAt(0)),
    4,
  )
  if (large) view.setBigUint64(8, BigInt(bytes.length))
  bytes.set(body, headerSize)
  return bytes
}

function mvhd({ timescale, duration, version = 0 }: Record<string, number>): Uint8Array {
  const body = new Uint8Array(version === 1 ? 32 : 20)
  const view = new DataView(body.buffer)
  view.setUint8(0, version)
  if (version === 1) {
    view.setUint32(20, timescale)
    view.setBigUint64(24, BigInt(duration))
  } else {
    view.setUint32(12, timescale)
    view.setUint32(16, duration)
  }
  return box('mvhd', body)
}

const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

// Records every read so tests can assert the media data is never fetched
function reader(file: Uint8Array) {
  const reads: Array<[number, number]> = []
  const read: ReadRange = async (start, length) => {
    reads.push([start, length])
    return file.subarray(start, start + length)
  }
  return { read, reads }
}

const ftyp = box('ftyp', new Uint8Array(8))
const mdat = box('mdat', new Uint8Array(100_000))

describe('readMp4Duration', () => {
  it('reads moov placed before the media data', async () => {
    const file = concat(ftyp, box('moov', mvhd({ timescale: 1000, duration: 7000 })), mdat)
    expect(await readMp4Duration(reader(file).read, file.length)).toBe(7)
  })

  it('skips the media data when moov comes last', async () => {
    const file = concat(
      ftyp,
      mdat,
      box('moov', concat(box('trak', new Uint8Array(4)), mvhd({ timescale: 600, duration: 1500 }))),
    )
    const { read, reads } = reader(file)
    expect(await readMp4Duration(read, file.length)).toBe(2.5)
    expect(reads.every(([, length]) => length < 1000)).toBe(true)
  })

  it('handles version 1 headers and 64-bit box sizes', async () => {
    const file = concat(
      ftyp,
      box('mdat', new Uint8Array(32), { large: true }),
      box('moov', mvhd({ version: 1, timescale: 90_000, duration: 5_400_000 })),
    )
    expect(await readMp4Duration(reader(file).read, file.length)).toBe(60)
  })

  it('returns null for files that are not MP4', async () => {
    const file = new TextEncoder().encode('WEBVTT\n\n00:00.000 --> 00:02.000\nHola\n')
    expect(await readMp4Duration(reader(file).read, file.length)).toBeNull()
  })
})

describe('storageKey', () => {
  it('joins prefix, object key and filename', () => {
    expect(storageKey({ filename: 'clip.mp4', objectKey: 'abc', prefix: 'videos/' })).toBe(
      'videos/abc/clip.mp4',
    )
    expect(storageKey({ filename: 'clip.mp4', objectKey: 'abc', prefix: '' })).toBe('abc/clip.mp4')
    expect(storageKey({ filename: 'clip.mp4' })).toBe('clip.mp4')
  })
})

describe('cacheControlFor', () => {
  it('lets shared caches keep public files only', () => {
    expect(cacheControlFor('public')).toMatch(/^public/)
    expect(cacheControlFor('private')).toBe('private, no-store')
    expect(cacheControlFor(undefined)).toBe('private, no-store')
  })
})
