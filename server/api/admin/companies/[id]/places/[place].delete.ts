import { requireAdmin } from '../../../../../utils/admin'
import { removePlaceFromCompany } from '../../../../../utils/companies'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id, place } = getRouterParams(event) as { id: string; place: string }
  return removePlaceFromCompany(id, decodeURIComponent(place))
})
