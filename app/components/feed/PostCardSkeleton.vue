<script setup lang="ts">
const props = withDefaults(defineProps<{ aspect?: string }>(), { aspect: '3/4' })
</script>

<template>
  <div
    class="skeleton rounded-xl w-full"
    :style="{ aspectRatio: props.aspect }"
  />
</template>
