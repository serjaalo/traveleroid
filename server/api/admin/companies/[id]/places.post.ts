import { z } from 'zod'
import { requireAdmin } from '../../../../utils/admin'
import { addPlaceToCompany } from '../../../../utils/companies'

const bodySchema = z.object({ place: z.string().min(1).max(200) })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getRouterParams(event) as { id: string }
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error' })
  }
  return addPlaceToCompany(id, parsed.data.place)
})
