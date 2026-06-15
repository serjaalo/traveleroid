import { z } from 'zod'
import { getUserById, getUserIdByUsername, saveUser, toPublicUser } from '../../utils/users'

const bodySchema = z.object({
  name: z.string().min(1).max(60).optional(),
  username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_.-]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().or(z.string().startsWith('/')).optional()
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id
  const user = await getUserById(userId)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: parsed.error.flatten() })
  }

  const data = parsed.data

  if (data.username && data.username.toLowerCase() !== user.username.toLowerCase()) {
    const existing = await getUserIdByUsername(data.username)
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'Username already taken' })
    }
    user.username = data.username
  }
  if (data.name !== undefined) user.name = data.name
  if (data.bio !== undefined) user.bio = data.bio
  if (data.avatar !== undefined) user.avatar = data.avatar

  await saveUser(user)

  // Refresh session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar
    }
  })

  return toPublicUser(user, true)
})
