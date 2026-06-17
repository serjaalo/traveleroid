import { requireAdmin } from '../../../utils/admin'
import { listAdminPlaces } from '../../../utils/places.admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listAdminPlaces()
})
