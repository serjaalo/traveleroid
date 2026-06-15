<script setup lang="ts">
const props = defineProps<{ place?: string; postsCount?: number }>()
const emit = defineEmits(['back'])
</script>

<template>
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <div class="flex items-center gap-2 text-xs sm:text-sm text-amber-400 mb-1.5 sm:mb-2">
        <UIcon name="i-ion-location" class="size-4" />
        <span>Местоположение</span>
      </div>
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white break-words">{{ props.place || 'Местоположение' }}</h1>
      <p class="mt-1 text-xs sm:text-sm text-gray-400">{{ props.postsCount }} {{ props.postsCount === 1 ? 'фотография' : 'фотографий' }} в этом месте</p>
    </div>

    <button @click="$emit('back')" class="shrink-0 text-sm text-gray-300 hover:text-white flex items-center gap-2">
      <UIcon name="i-ion-arrow-back" class="size-4" />
      <span class="hidden sm:inline">Назад</span>
    </button>
  </div>
</template>