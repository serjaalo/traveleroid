import { listAllPosts } from '../../utils/posts'
import { toPostDtos } from '../../utils/postDto'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const viewerId = (session?.user as { id?: string } | undefined)?.id

  const query = getQuery(event)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 30))
  const offset = Math.max(0, Number(query.offset) || 0)

  const all = await listAllPosts()
  const slice = all.slice(offset, offset + limit)
  const items = await toPostDtos(slice, viewerId)
  return items
})
