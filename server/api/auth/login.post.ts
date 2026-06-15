import { z } from 'zod'
import { getUserByEmail, toSessionUser } from '../../utils/users'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
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

  const { email, password } = result.data
  const user = await getUserByEmail(email)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Bad credentials' })
  }

  const ok = await verifyPassword(user.passwordHash, password)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Bad credentials' })
  }

  await setUserSession(event, { user: toSessionUser(user) })
  return { user: toSessionUser(user) }
})
