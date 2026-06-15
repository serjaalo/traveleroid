<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navLinks } from '~/utils/links'

interface MyCompany {
  id: string
  name: string
  avatar: string
  places: string[]
}

const { user, clear: clearSession } = useUserSession()
const myCompany = ref<MyCompany | null>(null)
const showClaim = ref(false)
const claimKey = ref('')
const claimBusy = ref(false)
const claimError = ref('')

async function logout() {
  await clearSession()
  await navigateTo('/login')
}

async function loadMyCompany() {
  try {
    myCompany.value = await $fetch<MyCompany | null>('/api/companies/my')
  } catch {
    myCompany.value = null
  }
}

async function submitClaim() {
  if (!claimKey.value.trim()) return
  claimBusy.value = true
  claimError.value = ''
  try {
    await $fetch('/api/companies/claim', {
      method: 'POST',
      body: { key: claimKey.value.trim() }
    })
    showClaim.value = false
    claimKey.value = ''
    await loadMyCompany()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    claimError.value = err?.data?.statusMessage || err?.statusMessage || 'Неверный ключ'
  } finally {
    claimBusy.value = false
  }
}

onMounted(loadMyCompany)
watch(user, loadMyCompany)
</script>

<template>
  <aside class="hidden lg:flex flex-col fixed top-12 bottom-12 left-22 w-64 p-6 z-40">
    <div class="flex flex-col h-full justify-between">
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">Название</h1>
        </div>

        <nav class="space-y-4 overflow-y-auto pr-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:text-white hover:bg-gray-800/50"
            active-class="text-white"
          >
            <UIcon :name="link.icon" class="text-xl flex-shrink-0" />
            <span class="text-sm font-medium">{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <div class="space-y-2">
        <NuxtLink
          v-if="myCompany"
          :to="`/company/${myCompany.id}`"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white hover:bg-gray-800/50"
        >
          <img :src="myCompany.avatar || '/img.jpg'" class="w-6 h-6 rounded-md object-cover flex-shrink-0" />
          <span class="text-sm font-medium truncate">Компания</span>
        </NuxtLink>
        <button
          v-else
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white hover:bg-gray-800/50"
          @click="showClaim = true"
        >
          <UIcon name="i-ion-key" class="text-xl" />
          <span class="text-sm font-medium">Привязать компанию</span>
        </button>

        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-300 hover:text-red-400 hover:bg-gray-800/50"
        >
          <UIcon name="i-ion-log-out" class="text-xl" />
          <span class="text-sm font-medium">Выйти</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Right Sidebar -->
  <aside class="hidden lg:flex flex-col fixed top-12 bottom-2 right-22 w-64 px-6 py-0 bg-transparent z-30">
    <div class="flex flex-col h-full justify-end">
      <div class="text-xs text-gray-400">
        <p class="text-gray-500 mt-1">Условия использования</p>
        <p class="text-gray-500 mt-1">Конфиденциальность</p>
        <p class="text-gray-500 mt-3">© 2026 ИП «Голомарев С.К.»</p>
      </div>
    </div>
  </aside>

  <!-- Mobile Bottom Nav -->
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/70 backdrop-blur border-t border-gray-800 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
    <div class="grid grid-cols-4 gap-1 px-1 pt-1">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs transition text-gray-400 hover:text-white"
        active-class="text-blue-400"
      >
        <UIcon :name="link.icon" class="text-2xl mb-0.5" />
        <span class="text-[10px] sm:text-xs truncate max-w-full">{{ link.label }}</span>
      </NuxtLink>
    </div>
  </nav>

  <!-- Claim modal -->
  <Teleport to="body">
    <div
      v-if="showClaim"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 bg-black/70 backdrop-blur"
      @click.self="showClaim = false"
    >
      <div class="w-full max-w-md bg-[#0b0b0b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base sm:text-lg font-semibold text-white">Привязать компанию</h3>
          <button class="text-gray-400 hover:text-white p-1" @click="showClaim = false">
            <UIcon name="i-ion-close" class="text-xl" />
          </button>
        </div>
        <p class="text-sm text-gray-400 mb-3">Введите ключ, выданный администратором.</p>
        <input
          v-model="claimKey"
          placeholder="XXXXXXXXXXXXXXXX"
          class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition text-sm uppercase tracking-widest"
          @keyup.enter="submitClaim"
        />
        <p v-if="claimError" class="text-sm text-red-400 mt-2">{{ claimError }}</p>
        <div class="mt-4 flex gap-2 justify-end">
          <button
            class="px-4 py-2 rounded-xl text-sm bg-white/5 hover:bg-white/10 text-white"
            @click="showClaim = false"
          >Отмена</button>
          <button
            :disabled="claimBusy || !claimKey.trim()"
            class="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50"
            @click="submitClaim"
          >
            {{ claimBusy ? 'Привязка...' : 'Привязать' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
