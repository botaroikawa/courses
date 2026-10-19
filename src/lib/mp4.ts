// Reads `length` bytes starting at `start`; may return fewer at the end of the file
export type ReadRange = (start: number, length: number) => Promise<Uint8Array>

const HEADER = 16

// Duration in seconds of an MP4/MOV file, from the `mvhd` box inside `moov`. Walks the top-level
// boxes with small reads, so only the box headers and `moov` are fetched, wherever `moov` sits.
export async function readMp4Duration(read: ReadRange, fileSize: number): Promise<number | null> {
  let offset = 0
  while (offset + 8 <= fileSize) {
    const header = await read(offset, HEADER)
    const box = parseBoxHeader(header, fileSize - offset)
    if (!box) return null
    if (box.type === 'moov') {
      const moov = await read(offset + box.headerSize, box.size - box.headerSize)
      return findMvhdDuration(moov)
    }
    offset += box.size
  }
  return null
}

function parseBoxHeader(bytes: Uint8Array, remaining: number) {
  if (bytes.length < 8) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const type = String.fromCharCode(...bytes.subarray(4, 8))
  let size = view.getUint32(0)
  let headerSize = 8
  if (size === 1) {
    if (bytes.length < 16) return null
    size = Number(view.getBigUint64(8))
    headerSize = 16
  } else if (size === 0) {
    size = remaining
  }
  if (size < headerSize || size > remaining) return null
  return { type, size, headerSize }
}

function findMvhdDuration(moov: Uint8Array): number | null {
  let offset = 0
  while (offset + 8 <= moov.length) {
    const box = parseBoxHeader(moov.subarray(offset), moov.length - offset)
    if (!box) return null
    if (box.type === 'mvhd') {
      const body = moov.subarray(offset + box.headerSize, offset + box.size)
      const view = new DataView(body.buffer, body.byteOffset, body.byteLength)
      // version 0: 32-bit creation, modification, timescale, duration; version 1: 64-bit times
      const isV1 = view.getUint8(0) === 1
      const timescale = view.getUint32(isV1 ? 20 : 12)
      const duration = isV1 ? Number(view.getBigUint64(24)) : view.getUint32(16)
      return timescale > 0 ? duration / timescale : null
    }
    offset += box.size
  }
  return null
}
