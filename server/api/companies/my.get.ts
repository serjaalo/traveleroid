import { getCompanyByOwner } from '../../utils/companies'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return null
  const c = await getCompanyByOwner(userId)
  if (!c) return null
  return {
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    places: c.places
  }
})
