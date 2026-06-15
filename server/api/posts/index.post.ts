import { readMultipartFormData } from 'h3'
import { saveImageBuffer, readImageSize } from '../../utils/uploads'
import { createPost } from '../../utils/posts'
import { toPostDto } from '../../utils/postDto'
import { createReview } from '../../utils/reviews'
import { listAllowedPlaces } from '../../utils/companies'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: string }).id

  const form = await readMultipartFormData(event)
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'Form data required' })
  }

  const fields: Record<string, string> = {}
  let photoBuffer: Buffer | null = null
  let photoMime = ''
  let photoName = ''

  for (const part of form) {
    if (part.name === 'photo' && part.data && part.filename) {
      photoBuffer = part.data
      photoMime = part.type || ''
      photoName = part.filename
    } else if (part.name && !part.filename) {
      fields[part.name] = part.data.toString('utf-8')
    }
  }

  if (!photoBuffer) {
    throw createError({ statusCode: 400, statusMessage: 'Photo is required' })
  }
  const place = (fields.place || '').trim()
  if (!place) {
    throw createError({ statusCode: 400, statusMessage: 'Place is required' })
  }
  // Restrict places to those configured by admin via companies
  const allowed = await listAllowedPlaces()
  if (!allowed.includes(place)) {
    throw createError({ statusCode: 400, statusMessage: 'Выбрано недопустимое место. Выберите место из списка.' })
  }
  const rating = Number(fields.rating)
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Rating must be 0..5' })
  }
  const review = (fields.review || '').slice(0, 2000)
  const description = (fields.description || '').slice(0, 1000)

  if (photoBuffer.length > 8 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Photo too large (max 8MB)' })
  }

  const saved = saveImageBuffer(photoBuffer, { mimeType: photoMime, originalName: photoName })
  const dims = readImageSize(photoBuffer) || { width: 1080, height: 1080 }

  const post = await createPost({
    authorId: userId,
    photo: saved.url,
    place,
    rating: Math.round(rating),
    review,
    description,
    width: dims.width,
    height: dims.height
  })

  // Также создаём запись Review, если пользователь оставил текст отзыва
  if (review.trim() && rating >= 1) {
    await createReview({
      authorId: userId,
      postId: post.id,
      place,
      text: review.trim(),
      rating: Math.round(rating)
    })
  }

  return toPostDto(post, userId)
})
