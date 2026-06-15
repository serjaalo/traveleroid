<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import SearchSkeleton from '~/components/common/SearchSkeleton.vue'

interface SearchResult {
  query: string
  places: Array<{ place: string; postsCount: number; avgRating: number; coverPhoto: string | null }>
  posts: Array<{ id: string; src: string; place: string; title: string; author: { name: string; avatar: string } }>
  users: Array<{ id: string; username: string; name: string; avatar: string; bio: string }>
}

const q = ref('')
const loading = ref(false)
const result = ref<SearchResult>({ query: '', places: [], posts: [], users: [] })
const router = useRouter()

const doSearch = useDebounceFn(async (text: string) => {
  if (!text.trim()) {
    result.value = { query: '', places: [], posts: [], users: [] }
    return
  }
  loading.value = true
  try {
    const data = await $fetch<SearchResult>('/api/search', {
      query: { q: text.trim(), limit: 20 }
    })
    result.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}, 300)

watch(q, (v) => {
  doSearch(v)
})

function openPlace(place: string) {
  router.push(`/place/${encodeURIComponent(place)}`)
}
function openUser(username: string) {
  router.push(`/profile/${encodeURIComponent(username)}`)
}

const hasResults = computed(() =>
  result.value.places.length || result.value.posts.length || result.value.users.length
)
</script>

<template>
  <div class="h-full flex flex-col pb-24 lg:pb-0">
    <header class="mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-white">Поиск</h1>
      <p class="mt-1 text-xs sm:text-sm text-gray-400">Места, посты и путешественники</p>
    </header>

    <div class="relative mb-4 sm:mb-6">
      <UIcon name="i-ion-search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
      <input
        v-model="q"
        type="text"
        placeholder="Поиск..."
        class="w-full bg-[#0b0b0b] border border-white/10 rounded-xl py-3 sm:py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition text-sm sm:text-base"
      />
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto space-y-8">
      <SearchSkeleton v-if="loading" />

      <div v-else-if="!q.trim()" class="text-center text-gray-500 py-12 text-sm">
        Введите запрос
      </div>

      <div v-else-if="!hasResults" class="text-center text-gray-500 py-12 text-sm">
        Ничего не найдено
      </div>

      <template v-else>
        <section v-if="result.places.length">
          <h2 class="text-lg font-semibold text-white mb-3">Места</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="p in result.places"
              :key="p.place"
              class="group relative overflow-hidden rounded-2xl bg-gray-900 cursor-pointer aspect-square"
              @click="openPlace(p.place)"
            >
              <img v-if="p.coverPhoto" :src="p.coverPhoto" class="w-full h-full object-cover transition group-hover:scale-105" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                <UIcon name="i-ion-image" class="size-8" />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div class="absolute inset-x-0 bottom-0 p-3">
                <p class="text-sm font-semibold text-white truncate">{{ p.place }}</p>
                <p class="text-xs text-gray-300">{{ p.postsCount }} постов · ⭐ {{ p.avgRating }}</p>
              </div>
            </div>
          </div>
        </section>

        <section v-if="result.users.length">
          <h2 class="text-lg font-semibold text-white mb-3">Пользователи</h2>
          <div class="space-y-2">
            <div
              v-for="u in result.users"
              :key="u.id"
              class="flex items-center gap-3 p-3 rounded-2xl bg-[#0b0b0b] border border-white/10 cursor-pointer hover:bg-white/5 transition"
              @click="openUser(u.username)"
            >
              <img :src="u.avatar" class="w-12 h-12 rounded-full object-cover" />
              <div class="flex-1 min-w-0">
                <p class="text-white font-medium truncate">{{ u.name }}</p>
                <p class="text-xs text-gray-400 truncate">@{{ u.username }} · {{ u.bio }}</p>
              </div>
            </div>
          </div>
        </section>

        <section v-if="result.posts.length">
          <h2 class="text-lg font-semibold text-white mb-3">Посты</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="p in result.posts"
              :key="p.id"
              class="group relative overflow-hidden rounded-2xl bg-gray-900 cursor-pointer aspect-square"
              @click="openPlace(p.place)"
            >
              <img :src="p.src" class="w-full h-full object-cover transition group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div class="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p class="text-sm font-medium text-white truncate">{{ p.place }}</p>
                <p class="text-xs text-gray-300 truncate">{{ p.author.name }}</p>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
