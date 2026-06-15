<script setup lang="ts">
import Skeleton from '~/components/common/Skeleton.vue'
</script>

<template>
  <div class="bg-[#0b0b0b] p-2 space-y-2 rounded-xl h-full min-h-0 border border-white/10">
    <div
      v-for="i in 6"
      :key="i"
      class="flex items-center gap-3 rounded-xl px-3 py-2"
    >
      <Skeleton width="3rem" height="3rem" circle />
      <div class="flex-1 space-y-2">
        <Skeleton width="60%" height="0.875rem" />
        <Skeleton width="90%" height="0.75rem" />
      </div>
    </div>
  </div>
</template>
