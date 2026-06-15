export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  // keep user info but drop admin flag
  await setUserSession(event, { ...session, admin: false })
  return { ok: true }
})
