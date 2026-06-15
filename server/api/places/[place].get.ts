import { getPlaceAggregate } from '../../utils/places'

export default defineEventHandler(async (event) => {
  const { place } = getRouterParams(event) as { place: string }
  const decoded = decodeURIComponent(place)
  const data = await getPlaceAggregate(decoded)
  if (!data) {
    return {
      place: decoded,
      postsCount: 0,
      reviewsCount: 0,
      avgRating: 0,
      uniqueAuthors: 0,
      coverPhoto: null,
      lastActivity: ''
    }
  }
  return data
})
