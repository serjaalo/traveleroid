import { readMultipartFormData } from 'h3'
import { saveImageBuffer } from '../../../utils/uploads'
import { getCompany, saveCompany } from '../../../utils/companies'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id

  const { id } = getRouterParams(event) as { id: string }
  const company = await getCompany(id)
  if (!company) throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  if (company.ownerId !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: 'Form data required' })

  let buffer: Buffer | null = null
  let mime = ''
  let name = ''
  for (const part of form) {
    if (part.name === 'photo' && part.data && part.filename) {
      buffer = part.data
      mime = part.type || ''
      name = part.filename
      break
    }
  }
  if (!buffer) throw createError({ statusCode: 400, statusMessage: 'Photo is required' })
  if (buffer.length > 8 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Photo too large (max 8MB)' })
  }

  const saved = saveImageBuffer(buffer, { mimeType: mime, originalName: name })
  company.avatar = saved.url
  await saveCompany(company)

  return { avatar: company.avatar }
})
