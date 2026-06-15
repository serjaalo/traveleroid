import { deletePost, getPost } from '../../utils/posts'

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
  return { ok: true }
})
