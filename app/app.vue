<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
.page-enter-active,
.page-leave-active,
.layout-enter-active,
.layout-leave-active {
  transition: opacity 300ms ease-in-out;
}
.page-enter-from,
.page-leave-to,
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

/* Global element animations (reusable transitions) */

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Fade + scale (for modals/popups) */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* Slide up (bottom sheet / mobile modal) */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(24px);
}

/* Slide horizontal (tabs / chat open) */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* Expand / collapse (height auto via grid trick) */
.expand-enter-active,
.expand-leave-active {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 250ms ease, opacity 250ms ease;
  opacity: 0;
  overflow: hidden;
}
.expand-enter-to,
.expand-leave-from {
  grid-template-rows: 1fr;
  opacity: 1;
}
.expand-enter-active > *,
.expand-leave-active > * {
  min-height: 0;
  overflow: hidden;
}
</style>
