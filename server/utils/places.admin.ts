import { listAllPosts, deletePost } from './posts'
import { listAllReviews, deleteReview, deleteReviewsByPostId } from './reviews'
import { listCompanies, removePlaceFromCompany } from './companies'

function likesStore() {
  return useStorage('likes')
}

/**
 * Removes all likes attached to a given post. Mirrors the cascade logic
 * used elsewhere when a post is removed.
 */
async function deleteLikesByPostId(postId: string): Promise<number> {
  const keys = await likesStore().getKeys(`like:${postId}:`)
  for (const k of keys) {
    await likesStore().removeItem(k)
  }
  return keys.length
}

/**
 * Standalone places registry.
 *
 * In the original model a "place" exists implicitly when at least one
 * post / review / company is associated with it. To allow the admin to
 * pre-create empty places (so they show up in pickers) and to delete
 * places completely, we keep an explicit registry inside the
 * `indexes` storage under the key prefix `placereg:`.
 */

function store() {
  return useStorage('indexes')
}

function regKey(place: string) {
  return `placereg:${place}`
}

export async function listRegisteredPlaces(): Promise<string[]> {
  const keys = await store().getKeys('placereg:')
  return keys.map(k => k.replace(/^.*placereg:/, '')).sort((a, b) => a.localeCompare(b, 'ru'))
}

export async function registerPlace(place: string): Promise<void> {
  const trimmed = place.trim()
  if (!trimmed) return
  await store().setItem(regKey(trimmed), '1')
}

export async function unregisterPlace(place: string): Promise<void> {
  await store().removeItem(regKey(place))
}

export interface AdminPlaceItem {
  place: string
  postsCount: number
  reviewsCount: number
  company: { id: string; name: string } | null
  registered: boolean
}

/**
 * Returns list of all known places (registered + appearing in posts/reviews/companies)
 * with extra info about company attachment and counts.
 */
export async function listAdminPlaces(): Promise<AdminPlaceItem[]> {
  const [posts, reviews, companies, registered] = await Promise.all([
    listAllPosts(),
    listAllReviews(),
    listCompanies(),
    listRegisteredPlaces()
  ])

  const map = new Map<string, AdminPlaceItem>()

  function ensure(place: string): AdminPlaceItem {
    const cur = map.get(place)
    if (cur) return cur
    const item: AdminPlaceItem = {
      place,
      postsCount: 0,
      reviewsCount: 0,
      company: null,
      registered: false
    }
    map.set(place, item)
    return item
  }

  for (const p of posts) ensure(p.place).postsCount += 1
  for (const r of reviews) ensure(r.place).reviewsCount += 1
  for (const c of companies) {
    for (const place of c.places) {
      const item = ensure(place)
      item.company = { id: c.id, name: c.name }
    }
  }
  for (const place of registered) {
    const item = ensure(place)
    item.registered = true
  }

  return Array.from(map.values()).sort((a, b) => a.place.localeCompare(b.place, 'ru'))
}

/**
 * Fully removes a place: detaches it from any company, removes all posts and
 * reviews related to it, and removes its registration entry.
 */
export async function deletePlaceCompletely(place: string): Promise<{
  detachedFrom: string | null
  removedPosts: number
  removedReviews: number
  removedLikes: number
}> {
  const companies = await listCompanies()
  let detachedFrom: string | null = null
  for (const c of companies) {
    if (c.places.includes(place)) {
      await removePlaceFromCompany(c.id, place)
      detachedFrom = c.id
    }
  }

  const posts = await listAllPosts()
  let removedPosts = 0
  let removedLikes = 0
  let removedReviews = 0
  for (const p of posts) {
    if (p.place === place) {
      await deletePost(p.id)
      removedPosts += 1
      // Cascade: likes & reviews tied to this post
      removedLikes += await deleteLikesByPostId(p.id)
      removedReviews += await deleteReviewsByPostId(p.id)
    }
  }

  // Standalone reviews bound to the place (not tied to a post)
  const reviews = await listAllReviews()
  for (const r of reviews) {
    if (r.place === place) {
      await deleteReview(r.id)
      removedReviews += 1
    }
  }

  await unregisterPlace(place)

  return { detachedFrom, removedPosts, removedReviews, removedLikes }
}
