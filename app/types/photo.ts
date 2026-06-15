export interface Author {
  id: string
  name: string
  avatar: string
}

export interface Photo {
  id: number
  title: string
  src: string
  width: number
  height: number
  size: number
  createdAt: Date
  place: string
  author: Author
  rate: number
  description?: string
  review?: {
    text: string
    rating: number
  }
}

export interface ChatMessage {
  id: string
  authorId: string
  text: string
  createdAt: string
}

export interface Chat {
  id: string
  name: string
  avatarUrl: string
  messages: ChatMessage[]
}

export interface User {
  id: string
  username: string
  avatarUrl: string
}

export interface Profile {
  id: string
  name: string
  email: string
  username: string
  avatar: string
  bio: string
  stats: {
    photos: number
    reviews: number
    followers: number
    following: number
  }
}

export interface Review {
  id: string
  place: string
  text: string
  rating: number
  date: string
  avatar: string
}