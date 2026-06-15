import { z } from 'zod'
import { createReview } from '../../utils/reviews'
import { toReviewDto } from '../../utils/reviewDto'

const bodySchema = z.object({
  place: z.string().min(1).max(200),
  text: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5)
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: parsed.error.flatten() })
  }

  const rec = await createReview({
    authorId: userId,
    place: parsed.data.place.trim(),
    text: parsed.data.text.trim(),
    rating: parsed.data.rating
  })
  return toReviewDto(rec)
})
