import { requireAdmin } from '../../../utils/admin'
import { deletePlaceCompletely } from '../../../utils/places.admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { place } = getRouterParams(event) as { place: string }
  const decoded = decodeURIComponent(place)
  if (!decoded) {
    throw createError({ statusCode: 400, statusMessage: 'Place is empty' })
  }
  const result = await deletePlaceCompletely(decoded)
  return { ok: true, place: decoded, ...result }
})
