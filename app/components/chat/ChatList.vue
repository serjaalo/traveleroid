<script setup lang="ts">
interface MessageDto {
  id: string
  text: string
  createdAt: string
  authorId: string
}
interface ChatItem {
  id: string
  name: string
  avatarUrl: string
  lastMessage: MessageDto | null
  unreadCount: number
  createdAt: string
}

const props = defineProps<{
  chats: ChatItem[]
  selectedId?: string
}>()

const emit = defineEmits<{ (e: 'select', id: string): void }>()

function formatTime(iso?: string) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="bg-[#0b0b0b] p-2 space-y-2 rounded-xl overflow-y-auto h-full min-h-0 border border-white/10">
    <div
      v-for="chat in props.chats"
      :key="chat.id"
      class="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition-colors hover:bg-white/5"
      :class="chat.id === props.selectedId ? 'bg-white/6' : ''"
      @click="emit('select', chat.id)"
    >
      <NuxtImg
        :src="chat.avatarUrl || '/img.jpg'"
        class="w-12 h-12 rounded-full object-cover shrink-0"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <div class="truncate text-white font-medium">
            {{ chat.name }}
          </div>

          <div class="text-xs text-gray-400 shrink-0">
            {{ formatTime(chat.lastMessage?.createdAt) }}
          </div>
        </div>

        <div class="flex items-center justify-between gap-2">
          <div class="truncate text-sm text-gray-400">
            {{ chat.lastMessage?.text || 'Нет сообщений' }}
          </div>
          <span
            v-if="chat.unreadCount > 0"
            class="shrink-0 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white text-black text-xs font-semibold"
          >
            {{ chat.unreadCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
