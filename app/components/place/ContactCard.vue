<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
  description?: string
  avatar?: string
  empty?: boolean // no company assigned
}>()
const emit = defineEmits(['contact'])
</script>

<template>
  <!-- Empty state: no company yet -->
  <div
    v-if="props.empty"
    class="mt-6 md:mt-0 rounded-2xl p-6 bg-[#0b0b0b] border border-dashed border-white/20 text-center"
  >
    <UIcon name="i-ion-business" class="size-10 text-gray-500 mx-auto mb-3" />
    <p class="text-white font-semibold">Свободное место для компании</p>
    <p class="text-sm text-gray-400 mt-1">Здесь может появиться ваше тур-агентство, гостиница или сервис.</p>
    <p class="text-xs text-gray-500 mt-3">Получите ключ у администратора.</p>
  </div>

  <!-- Filled state: company linked -->
  <div v-else class="mt-6 md:mt-0 border border-white rounded-2xl p-4 bg-[#0b0b0b]">
    <div @click="$emit('contact')" class="cursor-pointer flex items-center gap-4">
      <img :src="props.avatar || '/img.jpg'" alt="company" class="w-12 h-12 rounded-2xl object-cover shrink-0" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="font-semibold text-white truncate">{{ props.title || 'Компания' }}</p>
          <span class="hidden lg:flex text-xs text-gray-400">· ответ обычно в чате</span>
        </div>
        <p class="text-sm text-gray-400 truncate">{{ props.description || 'Бронирования, индивидуальные туры и консультации по маршрутам.' }}</p>
      </div>
      <button @click.stop="$emit('contact')" class="hidden md:inline-flex items-center gap-2 cursor-pointer bg-white text-black px-3 py-2 rounded-md text-sm hover:shadow-sm transition">
        <UIcon name="i-ion-chatbubbles" class="w-4 h-4" />
        <span>Связаться</span>
      </button>
    </div>

    <div class="mt-4 md:hidden">
      <button @click="$emit('contact')" class="w-full text-center px-4 py-3 rounded-lg bg-gradient-to-r bg-white text-black font-semibold shadow-md hover:bg-white/80 transition">
        <div class="flex items-center justify-center gap-2">
          <UIcon name="i-ion-chatbubbles" class="w-5 h-5" />
          <span>Связаться</span>
        </div>
      </button>
    </div>
  </div>
</template>
