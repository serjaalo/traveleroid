import type { PublicUser, SessionUser, UserRecord } from '../types'
import { newId, nowIso } from './id'

// Storage keys:
//   user:<id> -> UserRecord
// Indexes (in 'indexes' storage):
//   email:<email-lowercase> -> userId
//   username:<username-lowercase> -> userId

function usersStore() {
  return useStorage('users')
}
function indexStore() {
  return useStorage('indexes')
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const u = await usersStore().getItem<UserRecord>(`user:${id}`)
  return u || null
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  return await indexStore().getItem<string>(`email:${email.toLowerCase()}`)
}

export async function getUserIdByUsername(username: string): Promise<string | null> {
  return await indexStore().getItem<string>(`username:${username.toLowerCase()}`)
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const id = await getUserIdByEmail(email)
  if (!id) return null
  return getUserById(id)
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const id = await getUserIdByUsername(username)
  if (!id) return null
  return getUserById(id)
}

export async function saveUser(user: UserRecord): Promise<void> {
  await usersStore().setItem(`user:${user.id}`, user)
  await indexStore().setItem(`email:${user.email.toLowerCase()}`, user.id)
  await indexStore().setItem(`username:${user.username.toLowerCase()}`, user.id)
}

export async function listUsers(): Promise<UserRecord[]> {
  const keys = await usersStore().getKeys('user:')
  const items: UserRecord[] = []
  for (const k of keys) {
    const u = await usersStore().getItem<UserRecord>(k)
    if (u) items.push(u)
  }
  return items
}

export function toPublicUser(u: UserRecord, includeEmail = false): PublicUser {
  return {
    id: u.id,
    email: includeEmail ? u.email : undefined,
    username: u.username,
    name: u.name,
    avatar: u.avatar,
    bio: u.bio,
    createdAt: u.createdAt
  }
}

export function toSessionUser(u: UserRecord): SessionUser {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    name: u.name,
    avatar: u.avatar
  }
}

function sanitizeUsername(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .replace(/^[._-]+|[._-]+$/g, '')
  return base || 'user'
}

export async function generateUniqueUsername(seed: string): Promise<string> {
  const base = sanitizeUsername(seed)
  let candidate = base
  let i = 1
  while (await getUserIdByUsername(candidate)) {
    i += 1
    candidate = `${base}${i}`
  }
  return candidate
}

export function defaultAvatar(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

export async function createUser(params: {
  email: string
  name: string
  passwordHash: string
  username?: string
  bio?: string
  avatar?: string
}): Promise<UserRecord> {
  const username = await generateUniqueUsername(params.username || params.email.split('@')[0]!)
  const id = newId()
  const user: UserRecord = {
    id,
    email: params.email.toLowerCase(),
    username,
    name: params.name,
    passwordHash: params.passwordHash,
    avatar: params.avatar || defaultAvatar(username),
    bio: params.bio || '',
    createdAt: nowIso()
  }
  await saveUser(user)
  return user
}
