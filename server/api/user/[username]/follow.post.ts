import { getUserByUsername } from '../../../utils/users'
import { follow } from '../../../utils/follows'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const meId = (session.user as { id: string }).id
  const { username } = getRouterParams(event) as { username: string }
  const target = await getUserByUsername(decodeURIComponent(username))
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }
  if (target.id === meId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot follow yourself' })
  }
  await follow(meId, target.id)
  return { ok: true }
})
