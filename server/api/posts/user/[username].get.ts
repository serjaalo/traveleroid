import { getUserByUsername } from '../../../utils/users'
import { listPostsByAuthor } from '../../../utils/posts'
import { toPostDtos } from '../../../utils/postDto'

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event) as { username: string }
  const user = await getUserByUsername(decodeURIComponent(username))
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }
  const session = await getUserSession(event)
  const viewerId = (session?.user as { id?: string } | undefined)?.id

  const posts = await listPostsByAuthor(user.id)
  return toPostDtos(posts, viewerId)
})
