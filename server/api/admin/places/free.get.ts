import { requireAdmin } from '../../../utils/admin'
import { listAdminPlaces } from '../../../utils/places.admin'

/**
 * Returns places that are not yet attached to any company.
 * Used by the admin panel to populate the place selector when adding
 * a place to an existing company.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const all = await listAdminPlaces()
  return all.filter(p => !p.company).map(p => p.place)
})
