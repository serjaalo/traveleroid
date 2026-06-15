import { getCompanyByPlace } from '../../../utils/companies'
import { getUserById } from '../../../utils/users'

export default defineEventHandler(async (event) => {
  const { place } = getRouterParams(event) as { place: string }
  const decoded = decodeURIComponent(place)
  const c = await getCompanyByPlace(decoded)
  if (!c) return null
  const owner = c.ownerId ? await getUserById(c.ownerId) : null
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    avatar: c.avatar,
    places: c.places,
    owner: owner ? { id: owner.id, username: owner.username, name: owner.name, avatar: owner.avatar } : null
  }
})
