<script setup lang="ts">
import Skeleton from '~/components/common/Skeleton.vue'
import PostCardSkeleton from '~/components/feed/PostCardSkeleton.vue'
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-[#0b0b0b] border border-white/10 rounded-2xl p-4">
      <Skeleton width="6rem" height="6rem" radius="1rem" />
      <div class="flex-1 space-y-2">
        <Skeleton width="40%" height="1.5rem" />
        <Skeleton width="80%" height="0.875rem" />
        <Skeleton width="30%" height="0.75rem" />
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <Skeleton v-for="i in 3" :key="i" width="7rem" height="2.25rem" radius="0.75rem" />
    </div>
    <div class="columns-2 sm:columns-3 md:columns-4 gap-3">
      <div v-for="i in 6" :key="i" class="mb-3 break-inside-avoid">
        <PostCardSkeleton :aspect="['3/4','4/3','1/1','4/5','3/4','1/1'][i - 1]" />
      </div>
    </div>
  </div>
</template>
