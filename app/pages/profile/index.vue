<script setup lang="ts">
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import ProfilePosts, { type ProfilePost } from '~/components/profile/ProfilePosts.vue'
import ProfileSkeleton from '~/components/profile/ProfileSkeleton.vue'
import ProfilePostsSkeleton from '~/components/profile/ProfilePostsSkeleton.vue'
import EditProfileModal from '~/components/profile/EditProfileModal.vue'
import { ref, onMounted } from 'vue'
import type { Profile } from '~/types/photo'

const { fetch: refreshSession } = useUserSession()

const profile = ref<Profile>({
  id: 'me',
  name: '',
  username: '',
  email: '',
  avatar: '/photos/photo_1.jpg',
  bio: 'Путешественник ✈️',
  stats: { photos: 0, reviews: 0, followers: 0, following: 0 }
})

const posts = ref<ProfilePost[]>([])
const liked = ref<ProfilePost[]>([])
const activeTab = ref<'posts' | 'liked'>('posts')
const direction = ref('slide-right')
const showEdit = ref(false)
const loadingProfile = ref(true)
const loadingPosts = ref(false)
const loadingLiked = ref(false)

async function loadPosts(username: string) {
  loadingPosts.value = true
  try {
    const data = await $fetch<Array<{ id: string; src: string; place: string; likesCount: number }>>(
      `/api/posts/user/${encodeURIComponent(username)}`
    )
    posts.value = data.map(p => ({ id: p.id, src: p.src, place: p.place, likesCount: p.likesCount }))
  } catch (e) {
    console.error('Failed to load posts', e)
    posts.value = []
  } finally {
    loadingPosts.value = false
  }
}

async function loadLiked(username: string) {
  loadingLiked.value = true
  try {
    const data = await $fetch<Array<{ id: string; src: string; place: string; likesCount: number }>>(
      `/api/posts/liked/${encodeURIComponent(username)}`
    )
    liked.value = data.map(p => ({ id: p.id, src: p.src, place: p.place, likesCount: p.likesCount }))
  } catch (e) {
    console.error('Failed to load liked', e)
    liked.value = []
  } finally {
    loadingLiked.value = false
  }
}

async function loadProfile() {
  loadingProfile.value = true
  try {
    const data = await $fetch<{
      id: string
      email?: string
      username: string
      name: string
      avatar: string
      bio: string
      stats: { photos: number; reviews: number; followers: number; following: number }
    }>('/api/user/profile')
    profile.value = {
      id: data.id,
      email: data.email || '',
      username: data.username,
      name: data.name,
      avatar: data.avatar || '/photos/photo_1.jpg',
      bio: data.bio || '',
      stats: data.stats
    }
    if (data.username) {
      await Promise.all([loadPosts(data.username), loadLiked(data.username)])
    }
  } catch (e) {
    console.error('Failed to load profile', e)
  } finally {
    loadingProfile.value = false
  }
}

function setTab(newTab: 'posts' | 'liked') {
  if (newTab === activeTab.value) return
  direction.value = newTab === 'liked' ? 'slide-left' : 'slide-right'
  activeTab.value = newTab
}

function onProfileUpdated(updates: Partial<Profile>) {
  if (updates.name !== undefined) profile.value.name = updates.name
  if (updates.bio !== undefined) profile.value.bio = updates.bio
  if (updates.avatar !== undefined) profile.value.avatar = updates.avatar
  if (updates.username !== undefined) profile.value.username = updates.username
  // refresh user session so sidebar/etc see fresh avatar
  refreshSession().catch(() => {})
}

function onPostDeleted(id: string) {
  posts.value = posts.value.filter(p => p.id !== id)
  if (profile.value.stats.photos > 0) profile.value.stats.photos -= 1
}

onMounted(loadProfile)
</script>

<template>
  <div class="h-full min-h-0 flex flex-col pb-24 lg:pb-0">
    <header class="mb-4 sm:mb-6 flex items-center justify-between gap-3">
      <h1 class="text-2xl sm:text-3xl font-bold text-white">Профиль</h1>
      <button
        class="shrink-0 flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-sm bg-[#0b0b0b] border border-white/10 text-white hover:bg-white/5 transition"
        @click="showEdit = true"
      >
        <UIcon name="i-ion-pencil" class="text-base" />
        <span class="hidden sm:inline">Редактировать</span>
      </button>
    </header>
    <div class="flex-1 min-h-0 flex flex-col">
      <ProfileSkeleton v-if="loadingProfile" />
      <template v-else>
        <div class="space-y-4 w-full">
          <ProfileHeader :profile="profile" />
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
                  >
                    Публикации
                  </button>

                  <button
                    @click="setTab('liked')"
                    :class="[
                      'px-5 sm:px-6 py-2 rounded-xl text-sm transition',
                      activeTab === 'liked' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    ]"
                  >
                    Понравившиеся
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Transition :name="direction" mode="out-in">
                <div :key="activeTab" class="p-0">
                  <template v-if="activeTab === 'posts'">
                    <ProfilePostsSkeleton v-if="loadingPosts" />
                    <ProfilePosts v-else :posts="posts" editable @deleted="onPostDeleted" />
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

    <EditProfileModal v-model="showEdit" :profile="profile" @updated="onProfileUpdated" />
  </div>
</template>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
