import { z } from 'zod'
import { isParticipant, createMessage } from '../../../utils/chats'
import { broadcastToChat } from '../../../plugins/socket'
import { saveImageBuffer } from '../../../utils/uploads'
import { readMultipartFormData, getHeader } from 'h3'

const jsonSchema = z.object({
  text: z.string().max(4000).optional().default(''),
  imageUrl: z.string().min(1).optional()
}).refine(d => (d.text && d.text.trim()) || d.imageUrl, {
  message: 'Either text or imageUrl is required'
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const { id } = getRouterParams(event) as { id: string }

  if (!(await isParticipant(id, userId))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const contentType = getHeader(event, 'content-type') || ''

  let text = ''
  let imageUrl: string | undefined

  if (contentType.startsWith('multipart/form-data')) {
    const form = await readMultipartFormData(event)
    if (!form) throw createError({ statusCode: 400, statusMessage: 'Empty form' })
    let photoBuffer: Buffer | null = null
    let photoMime = ''
    let photoName = ''
    for (const part of form) {
      if (part.name === 'photo' && part.data && part.filename) {
        photoBuffer = part.data
        photoMime = part.type || ''
        photoName = part.filename
      } else if (part.name === 'text' && !part.filename) {
        text = part.data.toString('utf-8')
      }
    }
    if (!photoBuffer && !text.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Empty message' })
    }
    if (photoBuffer) {
      if (photoBuffer.length > 8 * 1024 * 1024) {
        throw createError({ statusCode: 413, statusMessage: 'Photo too large (max 8MB)' })
      }
      const saved = saveImageBuffer(photoBuffer, { mimeType: photoMime, originalName: photoName })
      imageUrl = saved.url
    }
  } else {
    const body = await readBody(event)
    const parsed = jsonSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: parsed.error.flatten() })
    }
    text = parsed.data.text || ''
    imageUrl = parsed.data.imageUrl
  }

  const message = await createMessage(id, userId, text.trim(), imageUrl)
  broadcastToChat(id, 'message:new', message)
  return message
})
