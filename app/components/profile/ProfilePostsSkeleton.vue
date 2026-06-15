<script setup lang="ts">
import PostCardSkeleton from '~/components/feed/PostCardSkeleton.vue'
const aspects = ['3/4', '4/3', '1/1', '4/5', '5/4', '3/4', '2/3', '4/3', '3/4']
</script>

<template>
  <div class="columns-2 sm:columns-3 md:columns-3 gap-3">
    <div v-for="(a, i) in aspects" :key="i" class="mb-3 break-inside-avoid">
      <PostCardSkeleton :aspect="a" />
    </div>
  </div>
</template>
