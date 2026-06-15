import { getReview } from '../../utils/reviews'
import { toReviewDto } from '../../utils/reviewDto'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event) as { id: string }
  const r = await getReview(id)
  if (!r) throw createError({ statusCode: 404, statusMessage: 'Review not found' })
  return toReviewDto(r)
})
