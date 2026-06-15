import { getUserByUsername } from '../../../utils/users'
import { listLikedPostIdsByUser } from '../../../utils/likes'
import { getPost } from '../../../utils/posts'
import { toPostDtos } from '../../../utils/postDto'

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event) as { username: string }
  const user = await getUserByUsername(decodeURIComponent(username))
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const session = await getUserSession(event)
  const viewerId = (session?.user as { id?: string } | undefined)?.id

  const likes = await listLikedPostIdsByUser(user.id)
  const posts = []
  for (const l of likes) {
    const p = await getPost(l.postId)
    if (p) posts.push(p)
  }
  return toPostDtos(posts, viewerId)
})
