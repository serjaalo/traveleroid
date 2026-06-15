import { requireAdmin } from '../../../../../utils/admin'
import { deleteCompanyKey } from '../../../../../utils/companies'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id, key } = getRouterParams(event) as { id: string; key: string }
  await deleteCompanyKey(id, key)
  return { ok: true }
})
