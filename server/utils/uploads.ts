import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { newId } from './id'

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

export interface SavedFile {
  filename: string
  url: string // public URL e.g. /uploads/abc.jpg
}

export function uploadsDir(): string {
  const dir = join(process.cwd(), 'public', 'uploads')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function saveImageBuffer(buffer: Buffer, opts: { mimeType?: string; originalName?: string }): SavedFile {
  let ext = ''
  if (opts.originalName) ext = extname(opts.originalName).toLowerCase()
  if (!ext && opts.mimeType) ext = MIME_TO_EXT[opts.mimeType] || ''
  if (!ALLOWED_EXT.has(ext)) {
    throw createError({ statusCode: 415, statusMessage: 'Unsupported image type' })
  }
  const filename = `${newId()}${ext}`
  const dir = uploadsDir()
  writeFileSync(join(dir, filename), buffer)
  return { filename, url: `/uploads/${filename}` }
}

// Reads the dimensions of a JPEG/PNG/WEBP buffer without external deps.
// Returns null if cannot detect.
export function readImageSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null
  // PNG: 8-byte signature, then IHDR
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    const width = buf.readUInt32BE(16)
    const height = buf.readUInt32BE(20)
    return { width, height }
  }
  // JPEG: FF D8
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null
      const marker = buf[i + 1]!
      i += 2
      // SOF markers
      if (
        (marker >= 0xc0 && marker <= 0xc3)
        || (marker >= 0xc5 && marker <= 0xc7)
        || (marker >= 0xc9 && marker <= 0xcb)
        || (marker >= 0xcd && marker <= 0xcf)
      ) {
        const height = buf.readUInt16BE(i + 3)
        const width = buf.readUInt16BE(i + 5)
        return { width, height }
      }
      // skip segment
      const segLen = buf.readUInt16BE(i)
      i += segLen
    }
    return null
  }
  // WEBP RIFF....WEBPVP8
  if (
    buf.toString('ascii', 0, 4) === 'RIFF'
    && buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const fourcc = buf.toString('ascii', 12, 16)
    if (fourcc === 'VP8 ') {
      const width = buf.readUInt16LE(26) & 0x3fff
      const height = buf.readUInt16LE(28) & 0x3fff
      return { width, height }
    }
    if (fourcc === 'VP8L') {
      const b0 = buf[21]!, b1 = buf[22]!, b2 = buf[23]!, b3 = buf[24]!
      const w = 1 + (((b1 & 0x3f) << 8) | b0)
      const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
      return { width: w, height: h }
    }
    if (fourcc === 'VP8X') {
      const w = 1 + (buf[24]! | (buf[25]! << 8) | (buf[26]! << 16))
      const h = 1 + (buf[27]! | (buf[28]! << 8) | (buf[29]! << 16))
      return { width: w, height: h }
    }
  }
  return null
}
