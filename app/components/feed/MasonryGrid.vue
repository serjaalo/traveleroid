<script setup lang="ts">
import type { Photo } from '~/types/photo'
import { useElementSize } from '@vueuse/core'
import PostCardSkeleton from '~/components/feed/PostCardSkeleton.vue'

withDefaults(defineProps<{
  orientation?: 'vertical' | 'horizontal'
}>(), {
  orientation: 'vertical'
})

const { data: items, pending } = await useFetch<Photo[]>('/api/posts')

const scrollArea = useTemplateRef('scrollArea')
const { width } = useElementSize(() => scrollArea.value?.$el)

const lanes = computed(() => width.value < 600 ? 2 : 3)
const gap = computed(() => width.value < 600 ? 6 : 16)

const skeletonAspects = ['3/4', '4/3', '1/1', '4/5', '5/4', '3/4', '2/3', '4/3', '1/1', '3/2']
</script>

<template>
  <!-- Skeleton grid while loading -->
  <div v-if="pending" class="columns-2 sm:columns-3 md:columns-4 gap-2 sm:gap-4">
    <div
      v-for="(a, i) in skeletonAspects"
      :key="i"
      class="mb-2 sm:mb-4 break-inside-avoid"
    >
      <PostCardSkeleton :aspect="a" />
    </div>
  </div>

  <div v-else-if="!items || items.length === 0" class="flex flex-col items-center justify-center gap-3 h-full text-gray-400">
    <UIcon name="i-ion-image" class="size-12" />
    <p class="text-sm">Пока нет публикаций</p>
    <NuxtLink to="/create-post" class="mt-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-200 transition">
      Создать первый пост
    </NuxtLink>
  </div>

  <UScrollArea
    v-else-if="items"
    ref="scrollArea"
    v-slot="{ item }"
    :items="items"
    :orientation="orientation"
    :virtualize="{
      gap,
      lanes,
      estimateSize: 480
    }"
    class="w-full h-full pb-24"
  >
    <FeedPhotoCard :photo="item as Photo" />
  </UScrollArea>
</template>
