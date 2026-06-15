<script setup lang="ts">
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import ProfilePosts, { type ProfilePost } from '~/components/profile/ProfilePosts.vue'
import ProfileSkeleton from '~/components/profile/ProfileSkeleton.vue'
import ProfilePostsSkeleton from '~/components/profile/ProfilePostsSkeleton.vue'
import { ref, onMounted, computed } from 'vue'
import type { Profile } from '~/types/photo'

const route = useRoute()
const router = useRouter()
const username = computed(() => (route.params.username as string) || '')

const profile = ref<Profile>({
  id: '',
  name: '',
  username: '',
  email: '',
  avatar: '/photos/photo_1.jpg',
  bio: '',
  stats: { photos: 0, reviews: 0, followers: 0, following: 0 }
})
const isMe = ref(false)
const isFollowing = ref(false)
const followBusy = ref(false)
const posts = ref<ProfilePost[]>([])
const liked = ref<ProfilePost[]>([])
const activeTab = ref<'posts' | 'liked'>('posts')
const direction = ref('slide-right')
const notFound = ref(false)
const loadingProfile = ref(true)
const loadingPosts = ref(false)
const loadingLiked = ref(false)

async function loadProfile() {
  loadingProfile.value = true
  try {
    const data = await $fetch<{
      id: string
      username: string
      name: string
      avatar: string
      bio: string
      stats: { photos: number; reviews: number; followers: number; following: number }
      isMe: boolean
      isFollowing: boolean
    }>(`/api/user/${encodeURIComponent(username.value)}`)
    profile.value = {
      id: data.id,
      email: '',
      username: data.username,
      name: data.name,
      avatar: data.avatar || '/photos/photo_1.jpg',
      bio: data.bio || '',
      stats: data.stats
    }
    isMe.value = data.isMe
    isFollowing.value = data.isFollowing
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err?.statusCode === 404) notFound.value = true
    console.error(e)
  } finally {
    loadingProfile.value = false
  }
}

async function loadPosts() {
  loadingPosts.value = true
  try {
    const data = await $fetch<Array<{ id: string; src: string; place: string; likesCount: number }>>(
      `/api/posts/user/${encodeURIComponent(username.value)}`
    )
    posts.value = data.map(p => ({ id: p.id, src: p.src, place: p.place, likesCount: p.likesCount }))
  } catch (e) {
    posts.value = []
  } finally {
    loadingPosts.value = false
  }
}

async function loadLiked() {
  loadingLiked.value = true
  try {
    const data = await $fetch<Array<{ id: string; src: string; place: string; likesCount: number }>>(
      `/api/posts/liked/${encodeURIComponent(username.value)}`
    )
    liked.value = data.map(p => ({ id: p.id, src: p.src, place: p.place, likesCount: p.likesCount }))
  } catch {
    liked.value = []
  } finally {
    loadingLiked.value = false
  }
}

async function toggleFollow() {
  if (followBusy.value || isMe.value) return
  followBusy.value = true
  try {
    if (isFollowing.value) {
      await $fetch(`/api/user/${encodeURIComponent(profile.value.username)}/follow`, { method: 'DELETE' })
      isFollowing.value = false
      profile.value.stats.followers = Math.max(0, profile.value.stats.followers - 1)
    } else {
      await $fetch(`/api/user/${encodeURIComponent(profile.value.username)}/follow`, { method: 'POST' })
      isFollowing.value = true
      profile.value.stats.followers += 1
    }
  } catch (e) {
    console.error(e)
  } finally {
    followBusy.value = false
  }
}

function openChat() {
  router.push(`/chat?with=${encodeURIComponent(profile.value.username)}`)
}

function setTab(newTab: 'posts' | 'liked') {
  if (newTab === activeTab.value) return
  direction.value = newTab === 'liked' ? 'slide-left' : 'slide-right'
  activeTab.value = newTab
}

onMounted(async () => {
  await loadProfile()
  if (!notFound.value) {
    await Promise.all([loadPosts(), loadLiked()])
  }
})
</script>

<template>
  <div class="h-full min-h-0 flex flex-col pb-24 lg:pb-0">
    <header class="mb-4 sm:mb-6 flex items-center justify-between gap-3">
      <h1 class="text-2xl sm:text-3xl font-bold text-white truncate">@{{ profile.username || username }}</h1>
      <button @click="router.back()" class="shrink-0 text-sm text-gray-300 hover:text-white flex items-center gap-2">
        <UIcon name="i-ion-arrow-back" class="size-4" />
        <span class="hidden sm:inline">Назад</span>
      </button>
    </header>

    <div v-if="notFound" class="flex flex-col items-center justify-center gap-4 py-20">
      <UIcon name="i-ion-alert-circle" class="size-16 text-gray-500" />
      <p class="text-lg text-gray-400">Пользователь не найден</p>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col">
      <ProfileSkeleton v-if="loadingProfile" />
      <template v-else>
      <div class="space-y-4 w-full">
        <ProfileHeader :profile="profile" hide-username-inline />
      </div>

      <div v-if="!isMe" class="mt-4 flex flex-wrap gap-2">
        <button
          @click="toggleFollow"
          :disabled="followBusy"
          class="flex-1 sm:flex-none min-w-0 px-4 py-2 rounded-xl text-sm font-semibold transition"
          :class="isFollowing
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'bg-white text-black hover:bg-gray-200'"
        >
          {{ isFollowing ? 'Отписаться' : 'Подписаться' }}
        </button>
        <button
          @click="openChat"
          class="flex-1 sm:flex-none min-w-0 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0b0b0b] border border-white/10 text-white hover:bg-white/5 transition flex items-center justify-center gap-2"
        >
          <UIcon name="i-ion-chatbubbles" class="text-base" /> Написать
        </button>
      </div>

      <div class="w-full">
        <div class="flex flex-col min-h-0">
          <div class="shrink-0 mt-4">
            <div class="flex mb-4">
              <div class="bg-[#0b0b0b] border border-white/10 rounded-2xl p-1 flex gap-1">
                <button
                  @click="setTab('posts')"
                  :class="[
                    'px-5 sm:px-6 py-2 rounded-xl text-sm transition',
                    activeTab === 'posts' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                  ]"
                >Публикации</button>
                <button
                  @click="setTab('liked')"
                  :class="[
                    'px-5 sm:px-6 py-2 rounded-xl text-sm transition',
                    activeTab === 'liked' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                  ]"
                >Понравившиеся</button>
              </div>
            </div>
          </div>

          <div class="min-h-[80vh] lg:min-h-0">
            <Transition :name="direction" mode="out-in">
              <div :key="activeTab" class="p-0">
                <template v-if="activeTab === 'posts'">
                  <ProfilePostsSkeleton v-if="loadingPosts" />
                  <ProfilePosts v-else :posts="posts" />
                </template>
                <template v-else>
                  <ProfilePostsSkeleton v-if="loadingLiked" />
                  <ProfilePosts v-else :posts="liked" />
                </template>
              </div>
            </Transition>
          </div>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>
