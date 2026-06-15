import { requireAdmin } from '../../../../utils/admin'
import { listCompanyKeys, getCompany } from '../../../../utils/companies'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getRouterParams(event) as { id: string }
  const c = await getCompany(id)
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return listCompanyKeys(id)
})
