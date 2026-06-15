import { isAdmin } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  return { admin: await isAdmin(event) }
})
