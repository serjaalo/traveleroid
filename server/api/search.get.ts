import { listAllPosts } from '../utils/posts'
import { listUsers, toPublicUser } from '../utils/users'
import { aggregatePlaces } from '../utils/places'
import { toPostDtos } from '../utils/postDto'

function matches(text: string, q: string): boolean {
  return text.toLowerCase().includes(q)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '').trim().toLowerCase()
  const type = String(query.type || 'all') // all | places | posts | users
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))

  if (!q) {
    return { query: q, places: [], posts: [], users: [] }
  }

  const session = await getUserSession(event)
  const viewerId = (session?.user as { id?: string } | undefined)?.id

  const result: {
    query: string
    places: Array<{ place: string; postsCount: number; avgRating: number; coverPhoto: string | null }>
    posts: Awaited<ReturnType<typeof toPostDtos>>
    users: Array<{ id: string; username: string; name: string; avatar: string; bio: string }>
  } = { query: q, places: [], posts: [], users: [] }

  if (type === 'all' || type === 'places') {
    const all = await aggregatePlaces()
    result.places = all
      .filter(p => matches(p.place, q))
      .slice(0, limit)
      .map(p => ({ place: p.place, postsCount: p.postsCount, avgRating: p.avgRating, coverPhoto: p.coverPhoto }))
  }

  if (type === 'all' || type === 'posts') {
    const allPosts = await listAllPosts()
    const filtered = allPosts.filter(p =>
      matches(p.place, q) || matches(p.review || '', q) || matches(p.description || '', q)
    ).slice(0, limit)
    result.posts = await toPostDtos(filtered, viewerId)
  }

  if (type === 'all' || type === 'users') {
    const users = await listUsers()
    result.users = users
      .filter(u =>
        matches(u.username, q) || matches(u.name, q) || matches(u.bio || '', q)
      )
      .slice(0, limit)
      .map(u => {
        const pub = toPublicUser(u)
        return { id: pub.id, username: pub.username, name: pub.name, avatar: pub.avatar, bio: pub.bio }
      })
  }

  return result
})
