import { getCompany } from '../../utils/companies'
import { getUserById } from '../../utils/users'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event) as { id: string }
  const c = await getCompany(id)
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const owner = c.ownerId ? await getUserById(c.ownerId) : null
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    avatar: c.avatar,
    places: c.places,
    createdAt: c.createdAt,
    owner: owner ? { id: owner.id, username: owner.username, name: owner.name, avatar: owner.avatar } : null
  }
})
