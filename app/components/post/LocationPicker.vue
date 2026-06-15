<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const popularLocations = [
  'Байкал, Россия',
  'Горный Алтай, Россия',
  'Камчатка, Россия',
  'Карелия, Россия',
  'Крым, Россия',
  'Эльбрус, Россия',
  'Сочи, Россия',
  'Санкт-Петербург, Россия'
]
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-300">Местоположение</label>

    <div class="relative">
      <UIcon name="i-ion-location" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Введите место или выберите из списка..."
        class="w-full bg-[#0b0b0b] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
        list="locations-list"
      />
      <datalist id="locations-list">
        <option v-for="loc in popularLocations" :key="loc" :value="loc" />
      </datalist>
    </div>
  </div>
</template>