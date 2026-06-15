import { z } from 'zod'
import { requireAdmin } from '../../../utils/admin'
import { createCompany } from '../../../utils/companies'

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  avatar: z.string().min(1).optional(),
  places: z.array(z.string().min(1).max(200)).optional().default([])
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: parsed.error.flatten() })
  }
  return createCompany(parsed.data)
})
