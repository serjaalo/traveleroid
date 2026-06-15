import type { LikeRecord } from '../types'
import { nowIso } from './id'

function store() {
  return useStorage('likes')
}

function key(postId: string, userId: string) {
  return `like:${postId}:${userId}`
}

export async function likePost(postId: string, userId: string): Promise<void> {
  const rec: LikeRecord = { postId, userId, createdAt: nowIso() }
  await store().setItem(key(postId, userId), rec)
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  await store().removeItem(key(postId, userId))
}

export async function isLiked(postId: string, userId: string): Promise<boolean> {
  return Boolean(await store().getItem(key(postId, userId)))
}

export async function countLikes(postId: string): Promise<number> {
  const keys = await store().getKeys(`like:${postId}:`)
  return keys.length
}

export async function listLikedPostIdsByUser(userId: string): Promise<Array<{ postId: string; createdAt: string }>> {
  const keys = await store().getKeys('like:')
  const items: Array<{ postId: string; createdAt: string }> = []
  for (const k of keys) {
    if (!k.endsWith(`:${userId}`)) continue
    const rec = await store().getItem<LikeRecord>(k)
    if (rec) items.push({ postId: rec.postId, createdAt: rec.createdAt })
  }
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items
}
