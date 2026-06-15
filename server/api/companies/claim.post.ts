import { z } from 'zod'
import { consumeKey } from '../../utils/companies'

const bodySchema = z.object({ key: z.string().min(1).max(64) })

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error' })
  }
  return consumeKey(parsed.data.key.trim().toUpperCase(), userId)
})
