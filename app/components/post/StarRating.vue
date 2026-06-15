<script setup lang="ts">
const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const stars = [1, 2, 3, 4, 5]
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-300">Оценка</label>

    <div class="flex items-center gap-1">
      <button
        v-for="star in stars"
        :key="star"
        type="button"
        class="text-3xl transition hover:scale-110"
        :class="star <= modelValue ? 'text-amber-400' : 'text-gray-600'"
        @click="emit('update:modelValue', star)"
      >
        <UIcon :name="star <= modelValue ? 'i-ion-star' : 'i-ion-star-outline'" />
      </button>

      <span v-if="modelValue" class="ml-3 text-sm text-gray-400">
        {{ modelValue }} / 5
      </span>
    </div>
  </div>
</template>