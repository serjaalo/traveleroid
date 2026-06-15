import { z } from 'zod'
import { createUser, getUserByEmail, toSessionUser } from '../../utils/users'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(60),
  username: z.string().min(2).max(30).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = bodySchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: result.error.flatten()
    })
  }

  const { email, password, name, username } = result.data

  const existing = await getUserByEmail(email)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'User already exists' })
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser({ email, name, passwordHash, username })

  await setUserSession(event, { user: toSessionUser(user) })
  return { user: toSessionUser(user) }
})
