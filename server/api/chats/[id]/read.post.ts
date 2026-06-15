import { isParticipant, listMessages, markMessageRead } from '../../../utils/chats'
import { broadcastToChat } from '../../../plugins/socket'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const { id } = getRouterParams(event) as { id: string }
  if (!(await isParticipant(id, userId))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const messages = await listMessages(id, 1000)
  const updated: string[] = []
  for (const m of messages) {
    if (m.authorId !== userId && !m.read) {
      await markMessageRead(id, m.id)
      updated.push(m.id)
    }
  }
  if (updated.length) {
    broadcastToChat(id, 'message:read', { chatId: id, messageIds: updated, by: userId })
  }
  return { ok: true, count: updated.length }
})
