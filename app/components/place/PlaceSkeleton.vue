<script setup lang="ts">
import Skeleton from '~/components/common/Skeleton.vue'
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <Skeleton width="8rem" height="1rem" />
      <Skeleton width="50%" height="2.5rem" />
      <Skeleton width="30%" height="1rem" />
    </div>
    <div class="flex flex-col md:flex-row md:items-start md:gap-6 gap-3">
      <Skeleton width="100%" height="6rem" radius="1rem" />
      <Skeleton width="100%" height="6rem" radius="1rem" />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <Skeleton v-for="i in 3" :key="i" width="100%" height="22rem" radius="1rem" />
    </div>
  </div>
</template>
