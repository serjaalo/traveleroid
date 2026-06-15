<script setup lang="ts">
const props = withDefaults(defineProps<{
  username?: string | null
  text?: string
  prefix?: string
  bold?: boolean
}>(), {
  prefix: ''
})

const label = computed(() => props.text || (props.username ? `${props.prefix}${props.username}` : ''))
const to = computed(() => props.username ? `/profile/${encodeURIComponent(props.username)}` : null)
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="hover:underline"
    :class="bold ? 'font-semibold' : ''"
    @click.stop
  >{{ label }}</NuxtLink>
  <span v-else :class="bold ? 'font-semibold' : ''">{{ label }}</span>
</template>
