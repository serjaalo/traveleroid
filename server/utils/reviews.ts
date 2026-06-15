import type { ReviewRecord } from '../types'
import { newId, nowIso } from './id'

function store() {
  return useStorage('reviews')
}

export async function createReview(input: Omit<ReviewRecord, 'id' | 'createdAt'>): Promise<ReviewRecord> {
  const rec: ReviewRecord = {
    id: newId(),
    createdAt: nowIso(),
    ...input
  }
  await store().setItem(`review:${rec.id}`, rec)
  return rec
}

export async function getReview(id: string): Promise<ReviewRecord | null> {
  return (await store().getItem<ReviewRecord>(`review:${id}`)) || null
}

export async function deleteReview(id: string): Promise<void> {
  await store().removeItem(`review:${id}`)
}

export async function listAllReviews(): Promise<ReviewRecord[]> {
  const keys = await store().getKeys('review:')
  const items: ReviewRecord[] = []
  for (const k of keys) {
    const r = await store().getItem<ReviewRecord>(k)
    if (r) items.push(r)
  }
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items
}

export async function listReviewsByAuthor(authorId: string): Promise<ReviewRecord[]> {
  const all = await listAllReviews()
  return all.filter(r => r.authorId === authorId)
}

export async function listReviewsByPlace(place: string): Promise<ReviewRecord[]> {
  const all = await listAllReviews()
  return all.filter(r => r.place === place)
}

export async function countReviewsByAuthor(authorId: string): Promise<number> {
  return (await listReviewsByAuthor(authorId)).length
}

export async function deleteReviewsByPostId(postId: string): Promise<number> {
  const all = await listAllReviews()
  let removed = 0
  for (const r of all) {
    if (r.postId === postId) {
      await deleteReview(r.id)
      removed += 1
    }
  }
  return removed
}
