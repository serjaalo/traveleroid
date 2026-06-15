import { listChatsForUser, toChatDto } from '../../utils/chats'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const chats = await listChatsForUser(userId)
  return Promise.all(chats.map(c => toChatDto(c, userId)))
})
