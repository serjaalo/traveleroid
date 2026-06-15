<script setup lang="ts">
import Skeleton from '~/components/common/Skeleton.vue'
import PostCardSkeleton from '~/components/feed/PostCardSkeleton.vue'
</script>

<template>
  <div class="w-full">
    <!-- Mobile -->
    <div class="sm:hidden">
      <Skeleton width="100%" height="100vw" radius="1rem" block />
      <div class="mt-4 bg-[#0b0b0b] p-4 rounded-2xl space-y-3">
        <Skeleton width="60%" height="1.25rem" />
        <Skeleton width="100%" height="0.875rem" />
        <div class="flex gap-6 mt-2">
          <Skeleton v-for="i in 4" :key="i" width="3rem" height="2rem" />
        </div>
      </div>
    </div>

    <!-- Desktop -->
    <div class="hidden sm:block">
      <div class="flex items-start gap-4">
        <Skeleton width="12rem" height="12rem" radius="1rem" />
        <div class="flex-1 space-y-3">
          <Skeleton width="40%" height="2rem" />
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="80%" height="1rem" />
          <div class="flex gap-6 mt-3">
            <div v-for="i in 4" :key="i" class="space-y-1">
              <Skeleton width="3rem" height="1.25rem" />
              <Skeleton width="4rem" height="0.875rem" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mt-4">
      <Skeleton width="14rem" height="2.5rem" radius="1rem" />
    </div>

    <!-- Posts grid -->
    <div class="mt-4 columns-2 sm:columns-3 md:columns-3 gap-3">
      <div v-for="i in 6" :key="i" class="mb-3 break-inside-avoid">
        <PostCardSkeleton :aspect="['3/4','4/3','1/1','4/5','3/4','1/1'][i - 1]" />
      </div>
    </div>
  </div>
</template>
