import { getUserById, toPublicUser } from '../../utils/users'
import { countPostsByAuthor } from '../../utils/posts'
import { countReviewsByAuthor } from '../../utils/reviews'
import { countFollowers, countFollowing } from '../../utils/follows'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const user = await getUserById(userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const [photos, reviews, followers, following] = await Promise.all([
    countPostsByAuthor(user.id),
    countReviewsByAuthor(user.id),
    countFollowers(user.id),
    countFollowing(user.id)
  ])

  return {
    ...toPublicUser(user, true),
    stats: { photos, reviews, followers, following }
  }
})
