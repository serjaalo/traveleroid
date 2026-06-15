<script setup lang="ts">
import Skeleton from '~/components/common/Skeleton.vue'
</script>

<template>
  <div class="p-4 space-y-3">
    <div v-for="i in 6" :key="i" class="flex" :class="i % 2 ? 'justify-start' : 'justify-end'">
      <Skeleton :width="`${30 + (i * 7) % 40}%`" height="2.5rem" radius="1rem" />
    </div>
  </div>
</template>
