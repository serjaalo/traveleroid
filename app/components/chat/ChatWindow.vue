<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'

import ChatMessage from './ChatMessage.vue'
import ChatComposer from './ChatComposer.vue'

interface MessageDto {
  id: string
  authorId: string
  text: string
  imageUrl?: string
  createdAt: string
}
interface Participant {
  id: string
  username: string
  name: string
  avatar: string
}
interface ChatWithMessages {
  id: string
  name: string
  avatarUrl: string
  participants: Participant[]
  messages: MessageDto[]
}
interface CurrentUser {
  id: string
  username?: string
  avatarUrl?: string
}

const props = defineProps<{
  chat: ChatWithMessages | null
  currentUser: CurrentUser
  mobile?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', text: string): void
  (e: 'sendImage', file: File, caption: string): void
  (e: 'back'): void
}>()

const listRef = ref<HTMLElement | null>(null)

const usersById = computed<Record<string, Participant>>(() => {
  const m: Record<string, Participant> = {}
  for (const p of props.chat?.participants || []) m[p.id] = p
  return m
})

const other = computed<Participant | null>(() => {
  return props.chat?.participants?.find(p => p.id !== props.currentUser.id) || null
})

async function scrollToBottom() {
  await nextTick()
  if (!listRef.value) return
  listRef.value.scrollTop = listRef.value.scrollHeight
}

watch(
  () => props.chat?.messages.length,
  () => {
    scrollToBottom()
  }
)

function onSend(text: string) {
  emit('send', text)
}

function onSendImage(file: File, caption: string) {
  emit('sendImage', file, caption)
}
</script>

<template>
  <div
    v-if="props.chat"
    class="h-full min-h-0 overflow-hidden bg-[#0b0b0b] flex flex-col rounded-2xl border border-white/10"
  >
    <!-- Header -->
    <div class="shrink-0 border-b border-white/6 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4">
      <button
        v-if="props.mobile"
        class="text-gray-400 hover:text-white shrink-0 -ml-1 p-1"
        @click="emit('back')"
      >
        <UIcon name="i-ion-arrow-back" class="w-6 h-6" />
      </button>

      <NuxtLink
        :to="other?.username ? `/profile/${encodeURIComponent(other.username)}` : '#'"
        class="flex items-center gap-3 flex-1 min-w-0"
      >
        <NuxtImg
          :src="props.chat.avatarUrl || '/img.jpg'"
          class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
        />
        <div class="min-w-0">
          <div class="font-semibold text-white truncate hover:underline text-sm sm:text-base">
            {{ props.chat.name }}
          </div>
          <div v-if="other?.username" class="text-xs text-gray-400 truncate">@{{ other.username }}</div>
        </div>
      </NuxtLink>
    </div>

    <!-- Messages -->
    <div ref="listRef" class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
      <div v-if="!props.chat.messages.length" class="text-center text-gray-500 text-sm py-12">
        Напишите первое сообщение
      </div>
      <ChatMessage
        v-for="msg in props.chat.messages"
        :key="msg.id"
        :message="msg"
        :isOwn="msg.authorId === props.currentUser.id"
        :author="usersById[msg.authorId]"
      />
    </div>

    <!-- Composer -->
    <div class="shrink-0 border-t border-white/6 p-2 sm:p-4">
      <ChatComposer @send="onSend" @send-image="onSendImage" />
    </div>
  </div>
</template>
