<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import UserLink from '~/components/common/UserLink.vue'
import StarsDisplay from '~/components/common/StarsDisplay.vue'
import CompanySkeleton from '~/components/common/CompanySkeleton.vue'
import ProfilePostsSkeleton from '~/components/profile/ProfilePostsSkeleton.vue'

interface CompanyDto {
  id: string
  name: string
  description: string
  avatar: string
  places: string[]
  createdAt: string
  owner: { id: string; username: string; name: string; avatar: string } | null
}

interface PostItem {
  id: string
  src: string
  title: string
  place: string
  rate: number
  rating: number
  review: string
  description: string
  width: number
  height: number
  liked: boolean
  likesCount: number
  author: { id: string; username: string; name: string; avatar: string }
}

const route = useRoute()
const router = useRouter()
const { loggedIn, user } = useUserSession()

const id = computed(() => (route.params.id as string) || '')
const company = ref<CompanyDto | null>(null)
const notFound = ref(false)
const activePlace = ref<string>('')
const placePosts = ref<PostItem[]>([])
const loadingPosts = ref(false)

const isOwner = computed(() => company.value?.owner?.id === user.value?.id)

async function loadCompany() {
  try {
    company.value = await $fetch<CompanyDto>(`/api/companies/${id.value}`)
    if (company.value && company.value.places.length) {
      activePlace.value = company.value.places[0]!
    } else {
      activePlace.value = ''
    }
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err?.statusCode === 404) notFound.value = true
  }
}

async function loadPosts(place: string) {
  if (!place) { placePosts.value = []; return }
  loadingPosts.value = true
  try {
    const data = await $fetch<{ place: string; posts: PostItem[] }>(
      `/api/posts/place/${encodeURIComponent(place)}`
    )
    placePosts.value = data.posts
  } catch {
    placePosts.value = []
  } finally {
    loadingPosts.value = false
  }
}

function setPlace(place: string) {
  activePlace.value = place
}

function openChat() {
  if (company.value?.owner?.username) {
    router.push(`/chat?with=${encodeURIComponent(company.value.owner.username)}`)
  }
}

async function toggleLike(post: PostItem) {
  if (!loggedIn.value) return
  const next = !post.liked
  try {
    const result = await $fetch<{ liked: boolean; likesCount: number }>(
      `/api/posts/${post.id}/like`,
      { method: next ? 'POST' : 'DELETE' }
    )
    post.liked = result.liked
    post.likesCount = result.likesCount
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadCompany)
watch(activePlace, (p) => loadPosts(p))
</script>

<template>
  <div class="h-full min-h-0 flex flex-col pb-24 lg:pb-0">
    <header class="mb-4 sm:mb-6 flex items-center justify-between gap-3">
      <h1 class="text-2xl sm:text-3xl font-bold text-white">Компания</h1>
      <button @click="router.back()" class="shrink-0 text-sm text-gray-300 hover:text-white flex items-center gap-2">
        <UIcon name="i-ion-arrow-back" class="size-4" />
        <span class="hidden sm:inline">Назад</span>
      </button>
    </header>

    <div v-if="notFound" class="flex flex-col items-center justify-center gap-4 py-20">
      <UIcon name="i-ion-alert-circle" class="size-16 text-gray-500" />
      <p class="text-lg text-gray-400">Компания не найдена</p>
    </div>

    <CompanySkeleton v-else-if="!company" />

    <div v-else class="flex-1 min-h-0">
      <!-- Header card -->
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center bg-[#0b0b0b] border border-white/10 rounded-2xl p-3 sm:p-4">
        <div class="flex items-start gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1 min-w-0">
          <img :src="company.avatar || '/img.jpg'" class="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-lg sm:text-2xl font-bold text-white truncate">{{ company.name }}</p>
            <p v-if="company.description" class="text-xs sm:text-sm text-gray-300 mt-1">{{ company.description }}</p>
            <div v-if="company.owner" class="text-xs text-gray-400 mt-2">
              Владелец:
              <UserLink :username="company.owner.username" :text="company.owner.name" class="text-gray-200 hover:underline" />
            </div>
            <div v-else class="text-xs text-amber-400 mt-2">Компания пока не привязана к пользователю</div>
          </div>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button
            v-if="company.owner && !isOwner"
            class="w-full sm:w-auto justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 transition flex items-center gap-2"
            @click="openChat"
          >
            <UIcon name="i-ion-chatbubbles" class="text-base" /> Связаться
          </button>
        </div>
      </div>

      <!-- Tabs / places -->
      <div class="mt-6">
        <h2 class="text-lg font-semibold text-white mb-3">Места компании</h2>
        <div v-if="!company.places.length" class="text-sm text-gray-500 bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 text-center">
          У компании пока нет привязанных мест
        </div>
        <template v-else>
          <div class="flex flex-wrap gap-2 mb-4">
            <button
              v-for="p in company.places"
              :key="p"
              class="px-4 py-2 rounded-xl text-sm transition"
              :class="activePlace === p ? 'bg-white text-black font-semibold' : 'bg-[#0b0b0b] border border-white/10 text-gray-300 hover:bg-white/5'"
              @click="setPlace(p)"
            >{{ p }}</button>
          </div>

          <div class="flex items-center justify-between mb-3">
            <NuxtLink :to="`/place/${encodeURIComponent(activePlace)}`" class="text-sm text-gray-300 hover:text-white">
              Открыть страницу места →
            </NuxtLink>
          </div>

          <ProfilePostsSkeleton v-if="loadingPosts" />
          <div v-else-if="!placePosts.length" class="text-sm text-gray-500 text-center py-8">
            Пока нет постов в этом месте
          </div>
          <div v-else class="columns-2 sm:columns-3 md:columns-4 gap-3">
            <div v-for="p in placePosts" :key="p.id" class="mb-3 break-inside-avoid">
              <div class="group relative overflow-hidden rounded-2xl bg-gray-900">
                <img :src="p.src" loading="lazy" class="w-full h-auto object-cover" />
                <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <div class="flex items-center gap-2">
                    <UserLink :username="p.author.username" :text="p.author.name" class="text-xs text-gray-200 truncate flex-1" />
                    <StarsDisplay :value="p.rate" size="xs" />
                  </div>
                  <button
                    type="button"
                    class="mt-1 inline-flex items-center gap-1 text-xs"
                    :class="p.liked ? 'text-red-400' : 'text-white hover:text-red-300'"
                    @click="toggleLike(p)"
                  >
                    <UIcon :name="p.liked ? 'i-ion-heart' : 'i-ion-heart-outline'" />
                    <span>{{ p.likesCount }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
