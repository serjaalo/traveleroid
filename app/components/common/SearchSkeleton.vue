<script setup lang="ts">
import Skeleton from '~/components/common/Skeleton.vue'
</script>

<template>
  <div class="space-y-8">
    <div>
      <Skeleton width="8rem" height="1.25rem" />
      <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <Skeleton v-for="i in 4" :key="i" width="100%" height="10rem" radius="1rem" />
      </div>
    </div>
    <div>
      <Skeleton width="10rem" height="1.25rem" />
      <div class="mt-3 space-y-2">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 rounded-2xl bg-[#0b0b0b] border border-white/10">
          <Skeleton width="3rem" height="3rem" circle />
          <div class="flex-1 space-y-2">
            <Skeleton width="40%" height="0.875rem" />
            <Skeleton width="70%" height="0.75rem" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
