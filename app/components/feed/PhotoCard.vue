<script setup lang="ts">
import type { Photo } from '~/types/photo'
import { ref } from 'vue'
import UserLink from '~/components/common/UserLink.vue'
import StarsDisplay from '~/components/common/StarsDisplay.vue'

const props = defineProps<{
  photo: Photo & {
    id?: string | number
    likesCount?: number
    liked?: boolean
    author: { id?: string; username?: string; name: string; avatar: string }
  }
}>()

const errored = ref(false)
const router = useRouter()
const { loggedIn } = useUserSession()

const liked = ref<boolean>(!!props.photo.liked)
const likesCount = ref<number>(props.photo.likesCount ?? 0)
const likeBusy = ref(false)

function openDetail() {
  router.push(`/place/${encodeURIComponent(props.photo.place)}`)
}

async function toggleLike(e: MouseEvent) {
  e.stopPropagation()
  if (!loggedIn.value || !props.photo.id) return
  if (likeBusy.value) return
  likeBusy.value = true
  const next = !liked.value
  try {
    const result = await $fetch<{ liked: boolean; likesCount: number }>(
      `/api/posts/${props.photo.id}/like`,
      { method: next ? 'POST' : 'DELETE' }
    )
    liked.value = result.liked
    likesCount.value = result.likesCount
  } catch (err) {
    console.error('like error', err)
  } finally {
    likeBusy.value = false
  }
}
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl bg-gray-900 cursor-pointer"
    :style="{ aspectRatio: `${photo.width}/${photo.height}` }"
    @click="openDetail"
  >
    <img
      v-if="!errored"
      :src="photo.src"
      :alt="photo.title"
      loading="lazy"
      class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-50"
      @error="errored = true"
    />
    <div
      v-else
      class="flex size-full items-center justify-center bg-gray-800"
    >
      <UIcon name="i-ion-image" class="size-8 text-gray-500" />
    </div>

    <!-- Like button -->
    <button
      v-if="photo.id !== undefined"
      type="button"
      class="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs transition opacity-0 group-hover:opacity-100"
      :class="liked ? 'text-red-400' : 'hover:text-red-300'"
      :disabled="likeBusy"
      @click="toggleLike"
    >
      <UIcon :name="liked ? 'i-ion-heart' : 'i-ion-heart-outline'" class="text-base" />
      <span>{{ likesCount }}</span>
    </button>

    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <!-- Content overlay on hover -->
    <div class="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
      <p class="text-sm font-medium text-white truncate">
        {{ photo.place }}
      </p>
      <div class="mt-1 flex items-center gap-2">
        <UAvatar :src="photo.author.avatar" :alt="photo.author.name" size="2xs" />
        <UserLink
          :username="photo.author.username"
          :text="photo.author.name"
          class="text-xs text-gray-300 truncate"
        />
        <span class="ml-auto">
          <StarsDisplay :value="photo.rate" size="xs" />
        </span>
      </div>
    </div>
  </div>
</template>
