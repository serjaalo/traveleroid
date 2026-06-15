import { z } from 'zod'
import { findOrCreateDirectChat, toChatDto } from '../../utils/chats'
import { getUserById, getUserByUsername } from '../../utils/users'

const bodySchema = z.union([
  z.object({ userId: z.string().min(1) }),
  z.object({ username: z.string().min(1) })
])

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const meId = (session.user as { id: string }).id

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: parsed.error.flatten() })
  }

  let targetId: string | null = null
  if ('userId' in parsed.data) {
    const u = await getUserById(parsed.data.userId)
    if (u) targetId = u.id
  } else {
    const u = await getUserByUsername(parsed.data.username)
    if (u) targetId = u.id
  }
  if (!targetId) {
    throw createError({ statusCode: 404, statusMessage: 'Target user not found' })
  }

  const chat = await findOrCreateDirectChat(meId, targetId)
  return toChatDto(chat, meId)
})
