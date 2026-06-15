import { listPostsByPlace } from '../../../utils/posts'
import { toPostDtos } from '../../../utils/postDto'

export default defineEventHandler(async (event) => {
  const { place } = getRouterParams(event) as { place: string }
  const decoded = decodeURIComponent(place)
  const session = await getUserSession(event)
  const viewerId = (session?.user as { id?: string } | undefined)?.id

  const posts = await listPostsByPlace(decoded)
  const items = await toPostDtos(posts, viewerId)
  return { place: decoded, posts: items }
})
