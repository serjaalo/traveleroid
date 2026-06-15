import type { PostRecord } from '../types'
import { getUserById, toPublicUser } from './users'
import { countLikes, isLiked } from './likes'

export interface PostDto {
  id: string
  authorId: string
  author: {
    id: string
    username: string
    name: string
    avatar: string
  }
  src: string // alias for photo (frontend compatibility)
  photo: string
  width: number
  height: number
  place: string
  rating: number
  review: string
  description: string
  createdAt: string
  // Aliases used by existing UI (Photo type)
  title: string
  rate: number
  size: number
  likesCount: number
  liked: boolean
}

export async function toPostDto(post: PostRecord, viewerId?: string | null): Promise<PostDto> {
  const author = await getUserById(post.authorId)
  const [likesCount, liked] = await Promise.all([
    countLikes(post.id),
    viewerId ? isLiked(post.id, viewerId) : Promise.resolve(false)
  ])

  const authorPub = author ? toPublicUser(author) : null
  const placeTitle = post.place ? `${post.place.split(',')[0]}, ${post.place.split(', ').pop()}` : ''

  return {
    id: post.id,
    authorId: post.authorId,
    author: {
      id: authorPub?.id || post.authorId,
      username: authorPub?.username || 'unknown',
      name: authorPub?.name || 'Удалённый пользователь',
      avatar: authorPub?.avatar || ''
    },
    src: post.photo,
    photo: post.photo,
    width: post.width,
    height: post.height,
    place: post.place,
    rating: post.rating,
    review: post.review,
    description: post.description,
    createdAt: post.createdAt,
    title: placeTitle,
    rate: post.rating,
    size: 0,
    likesCount,
    liked
  }
}

export async function toPostDtos(posts: PostRecord[], viewerId?: string | null): Promise<PostDto[]> {
  return Promise.all(posts.map(p => toPostDto(p, viewerId)))
}
