import { countPostsByAuthor } from '../../utils/posts'
import { countReviewsByAuthor } from '../../utils/reviews'
import { countFollowers, countFollowing } from '../../utils/follows'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id

  const [photos, reviews, followers, following] = await Promise.all([
    countPostsByAuthor(userId),
    countReviewsByAuthor(userId),
    countFollowers(userId),
    countFollowing(userId)
  ])

  return { photos, reviews, followers, following }
})
