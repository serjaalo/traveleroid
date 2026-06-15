import { getPost } from '../../utils/posts'
import { toPostDto } from '../../utils/postDto'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event) as { id: string }
  const post = await getPost(id)
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  const session = await getUserSession(event)
  const viewerId = (session?.user as { id?: string } | undefined)?.id
  return toPostDto(post, viewerId)
})
