import { getUserByUsername } from '../../../utils/users'
import { listReviewsByAuthor } from '../../../utils/reviews'
import { toReviewDtos } from '../../../utils/reviewDto'

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event) as { username: string }
  const user = await getUserByUsername(decodeURIComponent(username))
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  const records = await listReviewsByAuthor(user.id)
  return toReviewDtos(records)
})
