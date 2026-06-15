import { listReviewsByPlace } from '../../../utils/reviews'
import { toReviewDtos } from '../../../utils/reviewDto'

export default defineEventHandler(async (event) => {
  const { place } = getRouterParams(event) as { place: string }
  const decoded = decodeURIComponent(place)
  const records = await listReviewsByPlace(decoded)
  return { place: decoded, reviews: await toReviewDtos(records) }
})
