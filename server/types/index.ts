export interface UserRecord {
  id: string
  email: string
  username: string
  name: string
  passwordHash: string
  avatar: string
  bio: string
  createdAt: string
}

export interface PublicUser {
  id: string
  email?: string
  username: string
  name: string
  avatar: string
  bio: string
  createdAt: string
}

export interface SessionUser {
  id: string
  email: string
  username: string
  name: string
  avatar: string
}

export interface PostRecord {
  id: string
  authorId: string
  photo: string // url path /api/uploads/<file> or /photos/...
  place: string
  rating: number
  review: string
  description: string
  width: number
  height: number
  createdAt: string
}

export interface ReviewRecord {
  id: string
  authorId: string
  postId?: string // optional link to source post (so we can cascade-delete)
  place: string
  text: string
  rating: number
  createdAt: string
}

export interface LikeRecord {
  postId: string
  userId: string
  createdAt: string
}

export interface FollowRecord {
  followerId: string
  followingId: string
  createdAt: string
}

export interface ChatRecord {
  id: string
  participants: string[] // user ids
  createdAt: string
  lastMessageAt?: string
}

export interface MessageRecord {
  id: string
  chatId: string
  authorId: string
  text: string
  imageUrl?: string
  createdAt: string
  read: boolean
}

export interface CompanyRecord {
  id: string
  name: string
  description: string
  avatar: string
  places: string[] // associated places (each place can belong to only one company)
  ownerId: string | null // user id when claimed
  createdAt: string
}

export interface CompanyKeyRecord {
  key: string
  companyId: string
  used: boolean
  usedBy: string | null
  usedAt: string | null
  createdAt: string
}
