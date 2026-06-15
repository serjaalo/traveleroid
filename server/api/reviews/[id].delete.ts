import { deleteReview, getReview } from '../../utils/reviews'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const { id } = getRouterParams(event) as { id: string }
  const r = await getReview(id)
  if (!r) throw createError({ statusCode: 404, statusMessage: 'Review not found' })
  if (r.authorId !== userId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  await deleteReview(id)
  return { ok: true }
})
