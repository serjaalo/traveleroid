<script setup lang="ts">
import type { Profile } from '~/types/photo'

const props = withDefaults(defineProps<{
  profile: Profile
  hideUsernameInline?: boolean
}>(), {
  hideUsernameInline: false
})
</script>

<template>
  <div class="w-full overflow-hidden">
    <!-- Mobile layout -->
    <div class="sm:hidden">
      <div class="relative">
        <NuxtImg
          :src="props.profile.avatar || '/photos/photo_1.jpg'"
          class="w-full aspect-[4/4] rounded-2xl object-cover"
        />

        <div class="absolute left-0 right-0 bottom-0 flex flex-col items-stretch">
          <div class="px-4 py-2">
            <div class="text-3xl font-bold text-white text-shadow-lg/30 truncate">{{ props.profile.name }}</div>
            <div v-if="props.profile.username && !props.hideUsernameInline" class="text-sm text-gray-200">@{{ props.profile.username }}</div>
          </div>
        </div>
      </div>

      <div class="mt-4 bg-[#0b0b0b] p-4 rounded-2xl">
        <p class="text-sm text-gray-300">{{ props.profile.bio }}</p>

        <div class="mt-4 flex items-center justify-between gap-6 text-sm text-gray-300">
          <div class="text-center">
            <div class="text-lg font-semibold text-white">{{ props.profile.stats.photos }}</div>
            <div class="text-xs text-gray-400">Посты</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-amber-400">{{ props.profile.stats.reviews }}</div>
            <div class="text-xs text-gray-400">Отзывы</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-white">{{ props.profile.stats.followers }}</div>
            <div class="text-xs text-gray-400">Подписчики</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-white">{{ props.profile.stats.following }}</div>
            <div class="text-xs text-gray-400">Подписки</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop/tablet layout -->
    <div class="hidden sm:block">
      <div>
        <div class="flex items-start gap-4">
          <NuxtImg
            :src="props.profile.avatar || '/photos/photo_1.jpg'"
            class="w-48 h-48 rounded-2xl object-cover border border-white"
          />

          <div class="flex-1">
            <div class="grid grid-cols-[1fr_auto] items-start gap-4">
              <div>
                <div class="flex items-center gap-3">
                  <div class="text-3xl font-bold text-white">{{ props.profile.name }}</div>
                  <div v-if="!props.hideUsernameInline" class="text-sm text-gray-400">{{ props.profile.username ? '@' + props.profile.username : props.profile.email }}</div>
                </div>

                <p class="mt-2 text-sm text-gray-300">{{ props.profile.bio }}</p>
              </div>
            </div>

            <div class="mt-4 grid items-start text-sm text-gray-300">
              <div class="flex items-center gap-6">
                <div class="text-center">
                  <div class="text-lg font-semibold text-white">{{ props.profile.stats.photos }}</div>
                  <div class="text-xs text-gray-400">Посты</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-amber-400">{{ props.profile.stats.reviews }}</div>
                  <div class="text-xs text-gray-400">Отзывы</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-white">{{ props.profile.stats.followers }}</div>
                  <div class="text-xs text-gray-400">Подписчики</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-white">{{ props.profile.stats.following }}</div>
                  <div class="text-xs text-gray-400">Подписки</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
