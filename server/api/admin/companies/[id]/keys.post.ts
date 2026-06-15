import { requireAdmin } from '../../../../utils/admin'
import { createCompanyKey, getCompany } from '../../../../utils/companies'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getRouterParams(event) as { id: string }
  const c = await getCompany(id)
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return createCompanyKey(id)
})
