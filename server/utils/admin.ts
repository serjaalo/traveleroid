import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event): Promise<void> {
  const session = await getUserSession(event)
  if (!session?.admin) {
    throw createError({ statusCode: 401, statusMessage: 'Admin access required' })
  }
}

export async function isAdmin(event: H3Event): Promise<boolean> {
  const session = await getUserSession(event)
  return Boolean(session?.admin)
}
