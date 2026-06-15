<script setup lang="ts">
const props = defineProps<{ modelValue: File | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', file: File | null): void }>()
const previewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (file) {
    emit('update:modelValue', file)
    previewUrl.value = URL.createObjectURL(file)
  }
}
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-300">Фото</label>

    <div
      class="relative border-2 border-dashed border-white/20 rounded-2xl p-2 transition hover:border-white/40 cursor-pointer"
      @click="fileInput?.click()"
    >
      <input
        :ref="el => { fileInput = el as HTMLInputElement }"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />

      <div v-if="!previewUrl" class="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-400 text-center px-3">
        <UIcon name="i-ion-camera" class="text-3xl sm:text-4xl mb-2 sm:mb-3" />
        <span class="text-sm">Нажмите, чтобы загрузить фото</span>
        <span class="text-xs text-gray-500 mt-1">JPEG, PNG, WebP</span>
      </div>

      <img
        v-else
        :src="previewUrl"
        class="w-full max-h-72 sm:max-h-96 object-contain rounded-xl"
        alt="Preview"
      />
    </div>
  </div>
</template>