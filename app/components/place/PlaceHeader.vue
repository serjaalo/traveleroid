<script setup lang="ts">
const props = defineProps<{ place?: string; postsCount?: number }>()
const emit = defineEmits(['back'])
</script>

<template>
  <div class="flex items-start justify-between">
    <div>
      <div class="flex items-center gap-2 text-sm text-amber-400 mb-2">
        <UIcon name="i-ion-location" class="size-4" />
        <span>Местоположение</span>
      </div>
      <h1 class="text-3xl font-bold text-white lg:text-4xl">{{ props.place || 'Местоположение' }}</h1>
      <p class="mt-1 text-sm text-gray-400">{{ props.postsCount }} {{ props.postsCount === 1 ? 'фотография' : 'фотографий' }} в этом месте</p>
    </div>

    <button @click="$emit('back')" class="text-sm text-gray-300 hover:text-white flex items-center gap-2">
      <UIcon name="i-ion-arrow-back" class="size-4" />
      Назад
    </button>
  </div>
</template>