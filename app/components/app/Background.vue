<template>
  <canvas ref="canvas" class="stars"></canvas>
</template>

<script setup>

import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {

  const c = canvas.value
  const ctx = c.getContext("2d")

  function resize() {

    const dpr = window.devicePixelRatio || 1

    const width = window.innerWidth
    const height = window.innerHeight

    c.width = width * dpr
    c.height = height * dpr

    c.style.width = width + "px"
    c.style.height = height + "px"

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resize()
  window.addEventListener("resize", resize)

  const STAR_COUNT = window.innerWidth < 768 ? 200 : 700

  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 3,
    speed: Math.random() * 0.2 + 0.05,
    opacity: Math.random(),
    twinkle: Math.random() * 0.02
  }))

  function draw() {

    ctx.clearRect(0, 0, c.width, c.height)

    stars.forEach(star => {

      star.y -= star.speed

      if (star.y < 0) {
        star.y = window.innerHeight
        star.x = Math.random() * window.innerWidth
      }

      star.opacity += star.twinkle

      if (star.opacity > 1 || star.opacity < 0) {
        star.twinkle *= -1
      }

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${star.opacity})`
      ctx.fill()

    })

    requestAnimationFrame(draw)
  }

  draw()

})

</script>

<style scoped>

.stars {
  background-color: black;
  position: fixed;
  inset: 0;
  z-index: -1;
}

</style>