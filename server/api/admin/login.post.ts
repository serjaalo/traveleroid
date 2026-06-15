import { z } from 'zod'

const bodySchema = z.object({ password: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Error' })
  }
  const cfg = useRuntimeConfig()
  if (!cfg.adminPassword) {
    throw createError({ statusCode: 500, statusMessage: 'ADMIN_PASSWORD not configured' })
  }
  if (parsed.data.password !== cfg.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Wrong password' })
  }
  await setUserSession(event, { admin: true })
  return { ok: true }
})
