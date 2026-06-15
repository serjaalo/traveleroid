import { getUserByUsername, toPublicUser } from '../../utils/users'
import { countPostsByAuthor } from '../../utils/posts'
import { countReviewsByAuthor } from '../../utils/reviews'
import { countFollowers, countFollowing, isFollowing } from '../../utils/follows'

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event) as { username: string }
  const user = await getUserByUsername(decodeURIComponent(username))
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const session = await getUserSession(event)
  const meId = (session?.user as { id?: string } | undefined)?.id

  const [photos, reviews, followers, following, followingMe] = await Promise.all([
    countPostsByAuthor(user.id),
    countReviewsByAuthor(user.id),
    countFollowers(user.id),
    countFollowing(user.id),
    meId ? isFollowing(meId, user.id) : Promise.resolve(false)
  ])

  return {
    ...toPublicUser(user, false),
    stats: { photos, reviews, followers, following },
    isFollowing: followingMe,
    isMe: meId === user.id
  }
})
