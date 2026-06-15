<script setup lang="ts">
import type { Review } from '~/types/photo'

const props = defineProps<{ reviews: Review[] }>()
</script>

<template>
  <div class="space-y-3">
    <div v-for="r in props.reviews" :key="r.id" class="bg-[#0b0b0b] p-4 rounded-2xl flex gap-4 items-start">
      <NuxtImg :src="r.avatar || '/img.jpg'" class="w-12 h-12 rounded-full object-cover shrink-0" />

      <div class="flex-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm text-white font-semibold">{{ r.place }}</div>
            <div class="text-xs text-gray-400">{{ r.date }}</div>
          </div>

          <div class="flex items-center gap-1">
            <span class="text-sm text-amber-400 font-semibold mr-1">{{ r.rating }}</span>
            <div class="flex">
              <UIcon v-for="n in 5" :key="n" name="i-ion-star" :class="n <= r.rating ? 'text-amber-400' : 'text-gray-700'" class="w-4 h-4" />
            </div>
          </div>
        </div>

        <p class="mt-2 text-sm text-gray-300">{{ r.text }}</p>
      </div>
    </div>
  </div>
</template>
