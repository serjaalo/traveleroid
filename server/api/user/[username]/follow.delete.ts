import { getUserByUsername } from '../../../utils/users'
import { unfollow } from '../../../utils/follows'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const meId = (session.user as { id: string }).id
  const { username } = getRouterParams(event) as { username: string }
  const target = await getUserByUsername(decodeURIComponent(username))
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }
  await unfollow(meId, target.id)
  return { ok: true }
})
