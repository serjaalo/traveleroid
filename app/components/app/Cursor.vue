<template>
  <div ref="glow" class="cursor-glow"></div>
</template>

<script setup>
import { onMounted, ref } from "vue"

const glow = ref(null)

onMounted(() => {
  window.addEventListener("mousemove", e => {
    glow.value.style.left = e.clientX + "px"
    glow.value.style.top = e.clientY + "px"
  })
})
</script>

<style scoped>
.cursor-glow {
  position: fixed;
  width: 500px;
  height: 500px;
  pointer-events: none;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;

  background: radial-gradient(
    circle,
    rgba(120,160,255,0.15) 0%,
    rgba(120,160,255,0.05) 30%,
    transparent 55%
  );
}
</style>