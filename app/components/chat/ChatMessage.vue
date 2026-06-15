<script setup lang="ts">
import UserLink from '~/components/common/UserLink.vue'

interface Msg {
  id: string
  authorId: string
  text: string
  imageUrl?: string
  createdAt: string
}
interface Author {
  id: string
  username: string
  name: string
  avatar: string
}
const props = defineProps<{
  message: Msg
  isOwn: boolean
  author?: Author | null
}>()

const time = computed(() => {
  try {
    return new Date(props.message.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})
</script>

<template>
  <div class="my-2 flex items-end gap-2" :class="props.isOwn ? 'justify-end' : 'justify-start'">
    <NuxtLink
      v-if="!props.isOwn && props.author"
      :to="props.author.username ? `/profile/${encodeURIComponent(props.author.username)}` : '#'"
      class="shrink-0"
    >
      <img
        :src="props.author.avatar || '/img.jpg'"
        :alt="props.author.name"
        class="w-8 h-8 rounded-full object-cover"
      />
    </NuxtLink>

    <div :class="['max-w-[70%] break-words', props.isOwn ? 'text-black bg-white rounded-2xl p-3' : 'text-white bg-white/5 rounded-2xl p-3']">
      <UserLink
        v-if="!props.isOwn && props.author"
        :username="props.author.username"
        :text="props.author.name"
        class="text-xs text-amber-400 block mb-1"
      />
      <a v-if="props.message.imageUrl" :href="props.message.imageUrl" target="_blank" rel="noopener" class="block">
        <img :src="props.message.imageUrl" class="rounded-xl max-h-72 object-cover mb-1" />
      </a>
      <div v-if="props.message.text" class="whitespace-pre-wrap">{{ props.message.text }}</div>
      <div class="text-xs mt-1 text-right" :class="props.isOwn ? 'text-gray-500' : 'text-gray-400'">{{ time }}</div>
    </div>
  </div>
</template>
