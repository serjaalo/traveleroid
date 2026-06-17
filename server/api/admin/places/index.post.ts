import { z } from 'zod'
import { requireAdmin } from '../../../utils/admin'
import { listAdminPlaces, registerPlace } from '../../../utils/places.admin'

const bodySchema = z.object({
  place: z.string().min(1).max(200)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: parsed.error.flatten() })
  }
  const place = parsed.data.place.trim()
  if (!place) {
    throw createError({ statusCode: 400, statusMessage: 'Place is empty' })
  }
  // Check duplicates among any known places (registered + from posts/reviews/companies)
  const existing = await listAdminPlaces()
  if (existing.some(p => p.place.toLowerCase() === place.toLowerCase())) {
    throw createError({ statusCode: 409, statusMessage: 'Такое место уже существует' })
  }
  await registerPlace(place)
  return { ok: true, place }
})
