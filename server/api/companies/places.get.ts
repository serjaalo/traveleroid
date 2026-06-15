import { listAllowedPlaces } from '../../utils/companies'

/**
 * Returns the list of all places that users are allowed to choose from
 * when creating a post (places attached to companies by admin).
 */
export default defineEventHandler(async () => {
  return listAllowedPlaces()
})
