<script setup lang="ts">
import MasonryGrid from '~/components/feed/MasonryGrid.vue'
</script>

<template>
  <div class="h-full flex flex-col">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Лента</h1>
        <p class="hidden sm:flex mt-1 text-sm text-gray-400">Откройте для себя красивые места со всего мира</p>
      </div>

      <NuxtLink
        to="/create-post"
        class="shrink-0 self-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm transition hover:bg-gray-200 shadow-lg"
      >
        <UIcon name="i-ion-add" class="text-lg" />
        <span class="inline">Создать пост</span>
      </NuxtLink>
    </header>

    <div class="flex-1 min-h-0">
      <MasonryGrid />
    </div>
  </div>
</template>