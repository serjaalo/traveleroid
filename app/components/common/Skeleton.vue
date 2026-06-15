<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: string
  height?: string
  radius?: string
  circle?: boolean
  block?: boolean
}>(), {
  width: '100%',
  height: '1rem',
  radius: '0.5rem',
  circle: false,
  block: false
})

const style = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.circle ? '9999px' : props.radius,
  display: props.block ? 'block' : 'inline-block'
}))
</script>

<template>
  <span class="skeleton align-middle" :style="style" />
</template>
