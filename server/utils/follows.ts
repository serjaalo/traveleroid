import type { FollowRecord } from '../types'
import { nowIso } from './id'

// follow:<followerId>:<followingId> -> FollowRecord
function store() {
  return useStorage('follows')
}

function key(followerId: string, followingId: string) {
  return `follow:${followerId}:${followingId}`
}

export async function follow(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) return
  const rec: FollowRecord = { followerId, followingId, createdAt: nowIso() }
  await store().setItem(key(followerId, followingId), rec)
}

export async function unfollow(followerId: string, followingId: string): Promise<void> {
  await store().removeItem(key(followerId, followingId))
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  return Boolean(await store().getItem(key(followerId, followingId)))
}

export async function listFollowing(userId: string): Promise<string[]> {
  const keys = await store().getKeys(`follow:${userId}:`)
  return keys.map(k => k.split(':').pop()!).filter(Boolean)
}

export async function listFollowers(userId: string): Promise<string[]> {
  const keys = await store().getKeys('follow:')
  const result: string[] = []
  for (const k of keys) {
    const parts = k.split(':')
    // follow:<follower>:<following>
    if (parts[2] === userId && parts[1]) result.push(parts[1])
  }
  return result
}

export async function countFollowers(userId: string): Promise<number> {
  return (await listFollowers(userId)).length
}

export async function countFollowing(userId: string): Promise<number> {
  return (await listFollowing(userId)).length
}
