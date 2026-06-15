import { getPost } from '../../../utils/posts'
import { likePost, countLikes } from '../../../utils/likes'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id

  const { id } = getRouterParams(event) as { id: string }
  const post = await getPost(id)
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  await likePost(id, userId)
  const likesCount = await countLikes(id)
  return { liked: true, likesCount }
})
