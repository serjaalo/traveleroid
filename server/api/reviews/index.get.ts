import { listAllReviews } from '../../utils/reviews'
import { toReviewDtos } from '../../utils/reviewDto'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 30))
  const offset = Math.max(0, Number(query.offset) || 0)
  const all = await listAllReviews()
  return toReviewDtos(all.slice(offset, offset + limit))
})
