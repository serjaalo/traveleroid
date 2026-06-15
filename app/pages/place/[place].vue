<script setup lang="ts">
import { computed, ref } from 'vue'

import PlaceHeader from '~/components/place/PlaceHeader.vue'
import PlaceStats from '~/components/place/PlaceStats.vue'
import ContactCard from '~/components/place/ContactCard.vue'
import UserLink from '~/components/common/UserLink.vue'
import StarsDisplay from '~/components/common/StarsDisplay.vue'
import PlaceSkeleton from '~/components/place/PlaceSkeleton.vue'

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

interface PlaceAggregate {
  place: string
  postsCount: number
  reviewsCount: number
  avgRating: number
  uniqueAuthors: number
  coverPhoto: string | null
  lastActivity: string
}

interface CompanyDto {
  id: string
  name: string
  description: string
  avatar: string
  place: string
  owner: { id: string; username: string; name: string; avatar: string } | null
}

const route = useRoute()
const router = useRouter()
const { loggedIn } = useUserSession()
const placeParam = computed(() => (route.params.place as string) || '')

const { data: placeData, pending } = await useFetch<{ place: string; posts: PostItem[] }>(
  () => `/api/posts/place/${encodeURIComponent(placeParam.value)}`,
  { watch: [placeParam] }
)

const { data: aggregate } = await useFetch<PlaceAggregate>(
  () => `/api/places/${encodeURIComponent(placeParam.value)}`,
  { watch: [placeParam] }
)

const { data: company } = await useFetch<CompanyDto | null>(
  () => `/api/companies/place/${encodeURIComponent(placeParam.value)}`,
  { watch: [placeParam] }
)

// local mutable state for likes (since posts come from useFetch, we mirror them in a ref)
const slides = ref<PostItem[]>([])
watch(
  () => placeData.value?.posts,
  (posts) => {
    slides.value = (posts || []).map(p => ({ ...p }))
  },
  { immediate: true }
)

const postsCount = computed(() => aggregate.value?.postsCount ?? slides.value.length)
const avgRating = computed(() => (aggregate.value?.avgRating ?? 0).toFixed(1))
const uniqueAuthors = computed(() => aggregate.value?.uniqueAuthors ?? new Set(slides.value.map(p => p.author?.id)).size)

const carouselItems = computed(() => slides.value.map(p => ({ ...p, class: 'px-2 basis-1/1 sm:basis-1/2 md:basis-1/3 lg:basis-1/3' })))

useSeoMeta({
  title: computed(() => `${placeData.value?.place ?? 'Местоположение'} — TravelApp`),
  description: computed(() => placeData.value ? `${postsCount.value} фото — ${placeData.value.place}` : 'Страница местоположения')
})

function goBack() {
  router.back()
}

function openChat() {
  if (company.value?.owner?.username) {
    router.push(`/chat?with=${encodeURIComponent(company.value.owner.username)}`)
    return
  }
  // fallback: open chat with first author of post if no company linked
  const firstAuthor = slides.value[0]?.author
  if (firstAuthor?.username) {
    router.push(`/chat?with=${encodeURIComponent(firstAuthor.username)}`)
  } else {
    router.push('/chat')
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
    console.error('like err', e)
  }
}
</script>

<template>
  <PlaceSkeleton v-if="pending && !placeData" />
  <div v-else class="space-y-8">
    <PlaceHeader :place="placeData?.place" :postsCount="postsCount" @back="goBack" />

    <div class="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
      <PlaceStats :postsCount="postsCount" :avgRating="avgRating" :uniqueAuthors="uniqueAuthors" />

      <div class="w-full md:flex-1 md:min-w-0">
        <ContactCard
          v-if="company"
          :title="company.name"
          :description="company.description"
          :avatar="company.avatar"
          @contact="openChat"
        />
        <ContactCard v-else empty />
      </div>
    </div>

    <div class="space-y-2 pb-24 lg:pb-0">
      <div class="space-y-6">
        <h2 class="text-xl font-semibold text-white">Фотографии и отзывы</h2>

        <div v-if="pending" class="flex items-center justify-center py-20">
          <UIcon name="i-ion-sync" class="size-10 animate-spin text-gray-400" />
        </div>

        <div v-else-if="!slides.length">
          <div class="flex flex-col items-center justify-center gap-4 py-20">
            <UIcon name="i-ion-alert-circle" class="size-16 text-gray-500" />
            <p class="text-lg text-gray-400">Пока нет публикаций об этом месте</p>
            <button @click="goBack" class="text-sm text-gray-300 hover:text-white">Вернуться назад</button>
          </div>
        </div>

        <div v-else>
          <UCarousel
            :items="carouselItems"
            :arrows="false"
            :dots="false"
            :drag-free="true"
            :wheel-gestures="true"
            :loop="true"
            align="start"
            class="rounded-xl overflow-hidden -mx-2"
          >
            <template #default="{ item }">
              <div class="p-2">
                <div v-if="item.review" class=" bg-[#0b0b0b] p-3 rounded-2xl rounded-b-none border border-b-0 border-white/10">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <img :src="item.author.avatar" alt="" class="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <UserLink
                          :username="item.author.username"
                          :text="item.author.name"
                          class="text-sm font-medium text-white block"
                        />
                        <p class="text-xs text-gray-500">{{ item.title }}</p>
                      </div>
                    </div>
                    <StarsDisplay :value="item.rate" size="sm" />
                  </div>
                  <p class="mt-2 text-sm text-gray-300">{{ item.review }}</p>
                </div>
                <div class="relative">
                  <img :src="item.src" :alt="item.title" loading="lazy" class="w-full max-h-95 rounded-2xl rounded-t-none border border-t-0 border-white/10 object-cover" />
                  <button
                    type="button"
                    class="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur text-sm transition"
                    :class="item.liked ? 'text-red-400' : 'text-white hover:text-red-300'"
                    @click="toggleLike(item)"
                  >
                    <UIcon :name="item.liked ? 'i-ion-heart' : 'i-ion-heart-outline'" class="text-base" />
                    <span>{{ item.likesCount }}</span>
                  </button>
                </div>
              </div>
            </template>
          </UCarousel>
        </div>
      </div>
    </div>
  </div>
</template>
