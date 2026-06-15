<script setup lang="ts">
import PostPhotoUploader from '~/components/post/PhotoUploader.vue'
import PostLocationPicker from '~/components/post/LocationPicker.vue'
import PostStarRating from '~/components/post/StarRating.vue'
import PostReviewField from '~/components/post/ReviewField.vue'

const photo = ref<File | null>(null)
const location = ref('')
const rating = ref(0)
const review = ref('')
const description = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  if (!photo.value) {
    errorMessage.value = 'Загрузите фото'
    return
  }
  if (!location.value.trim()) {
    errorMessage.value = 'Укажите местоположение'
    return
  }

  isSubmitting.value = true

  try {
    const form = new FormData()
    form.append('photo', photo.value)
    form.append('place', location.value.trim())
    form.append('rating', String(rating.value))
    form.append('review', review.value)
    form.append('description', description.value)

    await $fetch('/api/posts', {
      method: 'POST',
      body: form
    })

    await navigateTo('/')
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    errorMessage.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Ошибка публикации'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="h-full flex flex-col pb-280 lg:pb-0">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Новый пост</h1>
        <p class="mt-1 text-sm text-gray-400">Поделитесь впечатлениями о путешествии</p>
      </div>

      <NuxtLink
        to="/"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
      >
        <UIcon name="i-ion-close" class="text-xl" />
      </NuxtLink>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-2xl mx-auto space-y-6">
        <PostPhotoUploader v-model="photo" />

        <PostLocationPicker v-model="location" />

        <PostStarRating v-model="rating" />

        <PostReviewField v-model="review" />

        <div v-if="errorMessage" class="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p class="text-red-400 text-sm flex items-center gap-2">
            <UIcon name="i-ion-warning" class="text-lg shrink-0" />
            {{ errorMessage }}
          </p>
        </div>

        <div class="pt-4 pb-8">
          <button
            :disabled="isSubmitting"
            class="w-full py-3.5 rounded-xl font-semibold text-base transition disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isSubmitting
              ? 'bg-gray-800 text-gray-400'
              : 'bg-white text-black hover:bg-gray-200'"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
              <UIcon name="i-ion-load-c" class="animate-spin text-lg" />
              Публикация...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <UIcon name="i-ion-checkmark" class="text-lg" />
              Опубликовать
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
