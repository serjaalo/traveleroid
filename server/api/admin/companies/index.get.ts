import { requireAdmin } from '../../../utils/admin'
import { listCompanies } from '../../../utils/companies'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listCompanies()
})
