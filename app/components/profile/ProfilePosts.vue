<script setup lang="ts">
export interface ProfilePost {
  id: string
  src: string
  place: string
  likesCount: number
}

const props = withDefaults(defineProps<{
  posts: ProfilePost[]
  editable?: boolean
}>(), { editable: false })

const emit = defineEmits<{ (e: 'deleted', id: string): void }>()

const router = useRouter()
const busyId = ref<string | null>(null)

function openPlace(name: string) {
  router.push(`/place/${encodeURIComponent(name)}`)
}

async function deletePost(id: string) {
  if (!confirm('Удалить пост?')) return
  busyId.value = id
  try {
    await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
    emit('deleted', id)
  } catch (e) {
    console.error(e)
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div>
    <div v-if="!props.posts.length" class="text-center text-gray-400 py-12">
      <UIcon name="i-ion-image" class="size-12 mx-auto mb-3" />
      <p class="text-sm">Пока нет публикаций</p>
    </div>
    <div v-else class="columns-2 sm:columns-3 md:columns-3 gap-3">
      <div v-for="p in props.posts" :key="p.id" class="mb-3 break-inside-avoid">
        <div class="group relative overflow-hidden rounded-2xl bg-gray-900 cursor-pointer">
          <img
            :src="p.src"
            loading="lazy"
            class="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105 group-hover:brightness-75"
            @click="openPlace(p.place)"
          />

          <button
            v-if="props.editable"
            type="button"
            class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 backdrop-blur text-white hover:bg-red-500/80 transition opacity-0 group-hover:opacity-100"
            :disabled="busyId === p.id"
            @click.stop="deletePost(p.id)"
          >
            <UIcon :name="busyId === p.id ? 'i-ion-sync' : 'i-ion-close'" :class="busyId === p.id ? 'animate-spin' : ''" class="text-base" />
          </button>

          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div class="absolute left-0 right-0 bottom-0 p-3 text-sm text-white flex items-center justify-between pointer-events-none">
            <div class="truncate font-medium text-sm">{{ p.place }}</div>
            <div class="flex items-center gap-1 text-sm text-gray-200">❤ <span>{{ p.likesCount }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
