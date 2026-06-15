import { listAllPosts } from './posts'
import { listAllReviews } from './reviews'

export interface PlaceAggregate {
  place: string
  postsCount: number
  reviewsCount: number
  avgRating: number
  uniqueAuthors: number
  coverPhoto: string | null
  lastActivity: string
}

export async function aggregatePlaces(): Promise<PlaceAggregate[]> {
  const [posts, reviews] = await Promise.all([listAllPosts(), listAllReviews()])

  const map = new Map<string, {
    postsCount: number
    reviewsCount: number
    ratingSum: number
    ratingCount: number
    authors: Set<string>
    coverPhoto: string | null
    lastActivity: string
  }>()

  for (const p of posts) {
    const cur = map.get(p.place) || {
      postsCount: 0,
      reviewsCount: 0,
      ratingSum: 0,
      ratingCount: 0,
      authors: new Set<string>(),
      coverPhoto: null,
      lastActivity: ''
    }
    cur.postsCount += 1
    if (p.rating > 0) {
      cur.ratingSum += p.rating
      cur.ratingCount += 1
    }
    cur.authors.add(p.authorId)
    if (!cur.coverPhoto) cur.coverPhoto = p.photo
    if (p.createdAt > cur.lastActivity) cur.lastActivity = p.createdAt
    map.set(p.place, cur)
  }

  for (const r of reviews) {
    const cur = map.get(r.place) || {
      postsCount: 0,
      reviewsCount: 0,
      ratingSum: 0,
      ratingCount: 0,
      authors: new Set<string>(),
      coverPhoto: null,
      lastActivity: ''
    }
    cur.reviewsCount += 1
    if (r.rating > 0) {
      cur.ratingSum += r.rating
      cur.ratingCount += 1
    }
    cur.authors.add(r.authorId)
    if (r.createdAt > cur.lastActivity) cur.lastActivity = r.createdAt
    map.set(r.place, cur)
  }

  const list: PlaceAggregate[] = []
  for (const [place, v] of map.entries()) {
    list.push({
      place,
      postsCount: v.postsCount,
      reviewsCount: v.reviewsCount,
      avgRating: v.ratingCount ? Number((v.ratingSum / v.ratingCount).toFixed(2)) : 0,
      uniqueAuthors: v.authors.size,
      coverPhoto: v.coverPhoto,
      lastActivity: v.lastActivity
    })
  }
  // sort by lastActivity desc
  list.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
  return list
}

export async function getPlaceAggregate(place: string): Promise<PlaceAggregate | null> {
  const all = await aggregatePlaces()
  return all.find(p => p.place === place) || null
}
