<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
const credentials = reactive({
  email: '',
  password: ''
})
const errorMessage = ref('')
const isSubmitting = ref(false)

async function login() {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password
      }
    })
    await refreshSession()
    await navigateTo('/')
  } catch {
    errorMessage.value = 'Неверный email или пароль'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-white tracking-tight">TravelApp</h1>
        <p class="mt-2 text-gray-400">Войдите в свой аккаунт</p>
      </div>

      <form @submit.prevent="login" class="bg-[#0b0b0b] border border-white/10 rounded-3xl p-8 space-y-5 shadow-2xl">
        <div class="space-y-1">
          <label class="text-sm text-gray-400 font-medium">Email</label>
          <div class="relative">
            <UIcon name="i-ion-mail" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
            <input
              v-model="credentials.email"
              type="email"
              placeholder="example@mail.com"
              required
              class="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition text-sm"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-sm text-gray-400 font-medium">Пароль</label>
          <div class="relative">
            <UIcon name="i-ion-lock-closed" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
            <input
              v-model="credentials.password"
              type="password"
              placeholder="••••••••"
              required
              class="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition text-sm"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p class="text-red-400 text-sm flex items-center gap-2">
            <UIcon name="i-ion-warning" class="text-lg shrink-0" />
            {{ errorMessage }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-3.5 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isSubmitting
            ? 'bg-gray-800 text-gray-400'
            : 'bg-white text-black hover:bg-gray-200'"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
            <UIcon name="i-ion-load-c" class="animate-spin text-base" />
            Вход...
          </span>
          <span v-else>Войти</span>
        </button>

        <p class="text-center text-sm text-gray-500">
          Нет аккаунта?
          <NuxtLink to="/register" class="text-white hover:underline font-medium">Зарегистрироваться</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>