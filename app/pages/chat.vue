<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ChatList from '~/components/chat/ChatList.vue'
import ChatWindow from '~/components/chat/ChatWindow.vue'
import ChatListSkeleton from '~/components/chat/ChatListSkeleton.vue'
import ChatMessagesSkeleton from '~/components/chat/ChatMessagesSkeleton.vue'
import { useChatSocket } from '~/composables/useChatSocket'

interface ChatDto {
  id: string
  name: string
  avatarUrl: string
  participants: Array<{ id: string; username: string; name: string; avatar: string }>
  lastMessage: MessageDto | null
  unreadCount: number
  createdAt: string
}
interface MessageDto {
  id: string
  chatId: string
  authorId: string
  text: string
  createdAt: string
  read: boolean
}

const { user } = useUserSession()
const currentUser = computed(() => ({
  id: user.value?.id || '',
  username: user.value?.username || '',
  avatarUrl: user.value?.avatar || '/img.jpg'
}))

const chats = ref<ChatDto[]>([])
const messagesMap = ref<Record<string, MessageDto[]>>({})
const selectedId = ref<string | null>(null)
const pendingChats = ref(true)
const pendingMessages = ref(false)

const selectedChat = computed<(ChatDto & { messages: MessageDto[] }) | null>(() => {
  const c = chats.value.find(x => x.id === selectedId.value)
  if (!c) return null
  return { ...c, messages: messagesMap.value[c.id] || [] }
})

async function loadChats() {
  pendingChats.value = true
  try {
    chats.value = await $fetch<ChatDto[]>('/api/chats')
  } catch (e) {
    console.error('load chats', e)
  } finally {
    pendingChats.value = false
  }
}

async function loadMessages(chatId: string) {
  pendingMessages.value = true
  try {
    const data = await $fetch<MessageDto[]>(`/api/chats/${chatId}/messages`)
    messagesMap.value = { ...messagesMap.value, [chatId]: data }
    // mark as read
    await $fetch(`/api/chats/${chatId}/read`, { method: 'POST' }).catch(() => {})
    const idx = chats.value.findIndex(c => c.id === chatId)
    if (idx >= 0) chats.value[idx]!.unreadCount = 0
  } catch (e) {
    console.error('load messages', e)
  } finally {
    pendingMessages.value = false
  }
}

const socket = useChatSocket()

socket.on('connect', () => {
  // re-join active chat after reconnect
  if (selectedId.value) socket.emit('chat:join', selectedId.value)
})
socket.on('message:new', (msg: MessageDto) => {
  const list = messagesMap.value[msg.chatId] ? [...messagesMap.value[msg.chatId]!] : []
  list.push(msg)
  messagesMap.value = { ...messagesMap.value, [msg.chatId]: list }
  // update last message in chats list
  const idx = chats.value.findIndex(c => c.id === msg.chatId)
  if (idx >= 0) {
    chats.value[idx]!.lastMessage = msg
    if (msg.chatId !== selectedId.value && msg.authorId !== currentUser.value.id) {
      chats.value[idx]!.unreadCount += 1
    }
    // move to top
    const updated = [chats.value[idx]!, ...chats.value.filter((_, i) => i !== idx)]
    chats.value = updated
  }
})

async function onSelect(id: string) {
  if (selectedId.value && selectedId.value !== id) {
    socket.emit('chat:leave', selectedId.value)
  }
  selectedId.value = id
  socket.emit('chat:join', id)
  if (!messagesMap.value[id]) {
    await loadMessages(id)
  } else {
    // still mark as read
    await $fetch(`/api/chats/${id}/read`, { method: 'POST' }).catch(() => {})
    const idx = chats.value.findIndex(c => c.id === id)
    if (idx >= 0) chats.value[idx]!.unreadCount = 0
  }
}

async function onSend(text: string) {
  if (!selectedId.value || !text.trim()) return
  try {
    await $fetch(`/api/chats/${selectedId.value}/messages`, {
      method: 'POST',
      body: { text }
    })
  } catch (e) {
    console.error('send', e)
  }
}

async function onSendImage(file: File, caption: string) {
  if (!selectedId.value || !file) return
  try {
    const form = new FormData()
    form.append('photo', file)
    if (caption) form.append('text', caption)
    await $fetch(`/api/chats/${selectedId.value}/messages`, {
      method: 'POST',
      body: form
    })
  } catch (e) {
    console.error('send image', e)
  }
}

function onBack() {
  if (selectedId.value) socket.emit('chat:leave', selectedId.value)
  selectedId.value = null
}

onMounted(loadChats)

// If a query param ?with=username — auto open chat with that user
const route = useRoute()
watch(
  () => route.query.with,
  async (uname) => {
    if (!uname || typeof uname !== 'string') return
    try {
      const created = await $fetch<ChatDto>('/api/chats', {
        method: 'POST',
        body: { username: uname }
      })
      // refresh list
      await loadChats()
      onSelect(created.id)
    } catch (e) {
      console.error('open chat with', e)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="h-full min-h-0 flex flex-col pb-24 lg:pb-24">
    <header class="mb-4 sm:mb-6" :class="{ 'hidden md:block': selectedId }">
      <h1 class="text-2xl sm:text-3xl font-bold text-white">Чат</h1>
    </header>

    <div class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
      <!-- Desktop list -->
      <div class="hidden md:block h-full overflow-y-auto">
        <ChatListSkeleton v-if="pendingChats" />
        <div v-else-if="!chats.length" class="text-center text-gray-400 py-8 text-sm">
          У вас пока нет чатов
        </div>
        <ChatList v-else :chats="chats" :selectedId="selectedId ?? undefined" @select="onSelect" />
      </div>

      <!-- Mobile: list or window -->
      <div class="md:hidden h-full relative">
        <Transition :name="selectedId ? 'slide-left' : 'slide-right'" mode="out-in">
          <div :key="selectedId ? 'window' : 'list'" class="h-full">
            <template v-if="!selectedId">
              <ChatListSkeleton v-if="pendingChats" />
              <div v-else-if="!chats.length" class="text-center text-gray-400 py-8 text-sm">
                У вас пока нет чатов
              </div>
              <ChatList v-else :chats="chats" @select="onSelect" />
            </template>
            <template v-else>
              <div v-if="pendingMessages" class="h-full bg-[#0b0b0b] rounded-2xl border border-white/10">
                <ChatMessagesSkeleton />
              </div>
              <ChatWindow v-else :chat="selectedChat" :currentUser="currentUser" mobile @back="onBack" @send="onSend" @send-image="onSendImage" />
            </template>
          </div>
        </Transition>
      </div>

      <!-- Desktop: window -->
      <div class="hidden md:block h-full overflow-y-auto">
        <Transition name="fade" mode="out-in">
          <div v-if="pendingMessages && selectedId" key="loading" class="h-full bg-[#0b0b0b] rounded-2xl border border-white/10">
            <ChatMessagesSkeleton />
          </div>
          <ChatWindow v-else-if="selectedChat" :key="selectedChat.id" :chat="selectedChat" :currentUser="currentUser" @send="onSend" @send-image="onSendImage" />
          <div v-else key="empty" class="h-full bg-[#0b0b0b] rounded-2xl border border-white/10 flex items-center justify-center text-white">Выберите чат</div>
        </Transition>
      </div>
    </div>
  </div>
</template>
