import { unlikePost, countLikes } from '../../../utils/likes'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const { id } = getRouterParams(event) as { id: string }
  await unlikePost(id, userId)
  const likesCount = await countLikes(id)
  return { liked: false, likesCount }
})
