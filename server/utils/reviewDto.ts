import type { ReviewRecord } from '../types'
import { getUserById, toPublicUser } from './users'

export interface ReviewDto {
  id: string
  authorId: string
  author: {
    id: string
    username: string
    name: string
    avatar: string
  }
  place: string
  text: string
  rating: number
  createdAt: string
  // Aliases for existing UI (Review type in app/types/photo)
  date: string
  avatar: string
}

export async function toReviewDto(rec: ReviewRecord): Promise<ReviewDto> {
  const author = await getUserById(rec.authorId)
  const a = author ? toPublicUser(author) : null
  return {
    id: rec.id,
    authorId: rec.authorId,
    author: {
      id: a?.id || rec.authorId,
      username: a?.username || 'unknown',
      name: a?.name || 'Удалённый пользователь',
      avatar: a?.avatar || ''
    },
    place: rec.place,
    text: rec.text,
    rating: rec.rating,
    createdAt: rec.createdAt,
    date: rec.createdAt.slice(0, 10),
    avatar: a?.avatar || '/img.jpg'
  }
}

export async function toReviewDtos(records: ReviewRecord[]): Promise<ReviewDto[]> {
  return Promise.all(records.map(r => toReviewDto(r)))
}
