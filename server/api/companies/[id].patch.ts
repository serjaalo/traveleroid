import { z } from 'zod'
import { getCompany, saveCompany } from '../../utils/companies'

const bodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id

  const { id } = getRouterParams(event) as { id: string }
  const company = await getCompany(id)
  if (!company) throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  if (company.ownerId !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: parsed.error.flatten() })
  }

  if (parsed.data.name !== undefined) company.name = parsed.data.name.trim()
  if (parsed.data.description !== undefined) company.description = parsed.data.description.trim()

  await saveCompany(company)
  return {
    id: company.id,
    name: company.name,
    description: company.description,
    avatar: company.avatar,
    places: company.places
  }
})
