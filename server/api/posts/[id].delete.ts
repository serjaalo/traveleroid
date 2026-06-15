import { deletePost, getPost } from '../../utils/posts'
import { deleteReviewsByPostId } from '../../utils/reviews'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id

  const { id } = getRouterParams(event) as { id: string }
  const post = await getPost(id)
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  if (post.authorId !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  await deletePost(id)
  // Cascade-delete linked review record (if any)
  await deleteReviewsByPostId(id)
  return { ok: true }
})
