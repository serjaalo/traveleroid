import { isParticipant, listMessages } from '../../../utils/chats'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const { id } = getRouterParams(event) as { id: string }
  if (!(await isParticipant(id, userId))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  const query = getQuery(event)
  const limit = Math.min(200, Math.max(1, Number(query.limit) || 100))
  const before = typeof query.before === 'string' ? query.before : undefined
  return listMessages(id, limit, before)
})
