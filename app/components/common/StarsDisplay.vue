<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>(), {
  size: 'sm'
})

const sizeClass = computed(() => ({
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl'
}[props.size]))

const rounded = computed(() => Math.max(0, Math.min(5, Math.round(props.value || 0))))
</script>

<template>
  <span class="inline-flex items-center gap-0.5" :class="sizeClass" :title="`${rounded}/5`">
    <UIcon
      v-for="n in 5"
      :key="n"
      :name="n <= rounded ? 'i-ion-star' : 'i-ion-star-outline'"
      :class="n <= rounded ? 'text-amber-400' : 'text-gray-600'"
    />
  </span>
</template>
