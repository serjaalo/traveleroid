<script setup lang="ts">
import AppSidebar from '~/components/app/AppSidebar.vue';
import Background from '~/components/app/Background.vue';
import Cursor from '~/components/app/Cursor.vue';

const { loggedIn } = useUserSession()
</script>

<template>
  <Background />
  <AppSidebar v-if="loggedIn" />
  <Cursor />
  <main>
    <UContainer class="h-screen pt-6 lg:pt-18 px-2">
      <slot />
    </UContainer>
  </main>
</template>