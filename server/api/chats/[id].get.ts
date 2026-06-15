import { getChat, toChatDto } from '../../utils/chats'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const { id } = getRouterParams(event) as { id: string }
  const chat = await getChat(id)
  if (!chat) throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  if (!chat.participants.includes(userId)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return toChatDto(chat, userId)
})
