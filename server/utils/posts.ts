import type { PostRecord } from '../types'
import { newId, nowIso } from './id'

function store() {
  return useStorage('posts')
}

export async function createPost(input: Omit<PostRecord, 'id' | 'createdAt'>): Promise<PostRecord> {
  const post: PostRecord = {
    id: newId(),
    createdAt: nowIso(),
    ...input
  }
  await store().setItem(`post:${post.id}`, post)
  return post
}

export async function getPost(id: string): Promise<PostRecord | null> {
  return (await store().getItem<PostRecord>(`post:${id}`)) || null
}

export async function deletePost(id: string): Promise<void> {
  await store().removeItem(`post:${id}`)
}

export async function listAllPosts(): Promise<PostRecord[]> {
  const keys = await store().getKeys('post:')
  const items: PostRecord[] = []
  for (const k of keys) {
    const p = await store().getItem<PostRecord>(k)
    if (p) items.push(p)
  }
  // sorted by date desc
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items
}

export async function listPostsByAuthor(authorId: string): Promise<PostRecord[]> {
  const all = await listAllPosts()
  return all.filter(p => p.authorId === authorId)
}

export async function listPostsByPlace(place: string): Promise<PostRecord[]> {
  const all = await listAllPosts()
  return all.filter(p => p.place === place)
}

export async function countPostsByAuthor(authorId: string): Promise<number> {
  return (await listPostsByAuthor(authorId)).length
}
