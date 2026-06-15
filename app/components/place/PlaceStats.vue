<script setup lang="ts">
const props = defineProps<{ postsCount: number; avgRating: string | number; uniqueAuthors: number }>()
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:gap-4 max-w-md w-full">
    <div class="text-center bg-[#0b0b0b] p-3 sm:p-4 rounded-2xl border border-white/10">
      <p class="text-xl sm:text-2xl font-bold text-white">{{ props.postsCount }}</p>
      <p class="text-xs text-gray-500">Фото</p>
    </div>

    <div class="text-center bg-[#0b0b0b] p-3 sm:p-4 rounded-2xl border border-white/10">
      <p class="text-xl sm:text-2xl font-bold text-amber-400">{{ props.avgRating }}</p>
      <p class="text-xs text-gray-500">Рейтинг</p>
    </div>

    <div class="text-center bg-[#0b0b0b] p-3 sm:p-4 rounded-2xl border border-white/10">
      <p class="text-xl sm:text-2xl font-bold text-white">{{ props.uniqueAuthors }}</p>
      <p class="text-xs text-gray-500">Авторов</p>
    </div>
  </div>
</template>
