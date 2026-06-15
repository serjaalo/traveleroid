import type { ChatRecord, MessageRecord } from '../types'
import { newId, nowIso } from './id'
import { getUserById } from './users'

function chatStore() {
  return useStorage('chats')
}
function messageStore() {
  return useStorage('messages')
}
function indexStore() {
  return useStorage('indexes')
}

// Index keys:
//   chatuser:<userId>:<chatId> -> chatId (membership)
//   directchat:<a>:<b> -> chatId (a < b lexicographically) for quickly finding 1-1 chats

function directKey(userA: string, userB: string) {
  const [a, b] = [userA, userB].sort()
  return `directchat:${a}:${b}`
}

export async function getChat(chatId: string): Promise<ChatRecord | null> {
  return (await chatStore().getItem<ChatRecord>(`chat:${chatId}`)) || null
}

export async function saveChat(chat: ChatRecord): Promise<void> {
  await chatStore().setItem(`chat:${chat.id}`, chat)
  for (const uid of chat.participants) {
    await indexStore().setItem(`chatuser:${uid}:${chat.id}`, chat.id)
  }
  if (chat.participants.length === 2) {
    await indexStore().setItem(directKey(chat.participants[0]!, chat.participants[1]!), chat.id)
  }
}

export async function findOrCreateDirectChat(userA: string, userB: string): Promise<ChatRecord> {
  if (userA === userB) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot chat with yourself' })
  }
  const existingId = await indexStore().getItem<string>(directKey(userA, userB))
  if (existingId) {
    const existing = await getChat(existingId)
    if (existing) return existing
  }
  const chat: ChatRecord = {
    id: newId(),
    participants: [userA, userB],
    createdAt: nowIso(),
    lastMessageAt: undefined
  }
  await saveChat(chat)
  return chat
}

export async function listChatsForUser(userId: string): Promise<ChatRecord[]> {
  const keys = await indexStore().getKeys(`chatuser:${userId}:`)
  const chats: ChatRecord[] = []
  for (const k of keys) {
    const chatId = k.split(':').pop()!
    const chat = await getChat(chatId)
    if (chat) chats.push(chat)
  }
  // sort by last activity desc
  chats.sort((a, b) => (b.lastMessageAt || b.createdAt).localeCompare(a.lastMessageAt || a.createdAt))
  return chats
}

export async function isParticipant(chatId: string, userId: string): Promise<boolean> {
  const chat = await getChat(chatId)
  return Boolean(chat && chat.participants.includes(userId))
}

// Messages

export async function listMessages(chatId: string, limit = 100, before?: string): Promise<MessageRecord[]> {
  const keys = await messageStore().getKeys(`message:${chatId}:`)
  const items: MessageRecord[] = []
  for (const k of keys) {
    const m = await messageStore().getItem<MessageRecord>(k)
    if (m) {
      if (before && m.createdAt >= before) continue
      items.push(m)
    }
  }
  items.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  if (limit && items.length > limit) {
    return items.slice(items.length - limit)
  }
  return items
}

export async function createMessage(chatId: string, authorId: string, text: string, imageUrl?: string): Promise<MessageRecord> {
  const message: MessageRecord = {
    id: newId(),
    chatId,
    authorId,
    text,
    imageUrl,
    createdAt: nowIso(),
    read: false
  }
  await messageStore().setItem(`message:${chatId}:${message.id}`, message)
  // update chat lastMessageAt
  const chat = await getChat(chatId)
  if (chat) {
    chat.lastMessageAt = message.createdAt
    await chatStore().setItem(`chat:${chat.id}`, chat)
  }
  return message
}

export async function markMessageRead(chatId: string, messageId: string): Promise<void> {
  const m = await messageStore().getItem<MessageRecord>(`message:${chatId}:${messageId}`)
  if (!m) return
  m.read = true
  await messageStore().setItem(`message:${chatId}:${messageId}`, m)
}

// DTO for client
export interface ChatDto {
  id: string
  name: string
  avatarUrl: string
  participants: Array<{ id: string; username: string; name: string; avatar: string }>
  lastMessage: MessageRecord | null
  unreadCount: number
  createdAt: string
}

export async function toChatDto(chat: ChatRecord, viewerId: string): Promise<ChatDto> {
  const others = chat.participants.filter(p => p !== viewerId)
  const otherUsers = await Promise.all(others.map(id => getUserById(id)))
  const messages = await listMessages(chat.id, 1)
  const lastMessage = messages.length ? messages[messages.length - 1]! : null

  // count unread (messages not authored by viewer and unread)
  const allMessages = await listMessages(chat.id, 1000)
  const unread = allMessages.filter(m => m.authorId !== viewerId && !m.read).length

  const participants = await Promise.all(chat.participants.map(async (id) => {
    const u = await getUserById(id)
    return u
      ? { id: u.id, username: u.username, name: u.name, avatar: u.avatar }
      : { id, username: 'unknown', name: 'Удалённый пользователь', avatar: '' }
  }))

  const otherFirst = otherUsers[0]
  const name = otherFirst ? otherFirst.name : 'Чат'
  const avatarUrl = otherFirst ? otherFirst.avatar : '/img.jpg'

  return {
    id: chat.id,
    name,
    avatarUrl,
    participants,
    lastMessage,
    unreadCount: unread,
    createdAt: chat.createdAt
  }
}
