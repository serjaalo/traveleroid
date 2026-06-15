<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const emit = defineEmits<{
  (e: 'send', text: string): void
  (e: 'sendImage', file: File, caption: string): void
}>()

const text = ref('')
const pendingImage = ref<File | null>(null)
const pendingPreview = ref<string | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const maxRows = 5

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  const style = getComputedStyle(el)
  const lineHeight = parseFloat(style.lineHeight || '20') || 20
  const maxHeight = lineHeight * maxRows
  const newHeight = Math.min(el.scrollHeight, maxHeight)
  el.style.height = `${newHeight}px`
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
}

watch(text, async () => {
  await nextTick()
  autoResize()
})

onMounted(() => {
  nextTick().then(autoResize)
})

function onPickFile() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (file) {
    pendingImage.value = file
    pendingPreview.value = URL.createObjectURL(file)
  }
  input.value = ''
}

function clearImage() {
  pendingImage.value = null
  if (pendingPreview.value) URL.revokeObjectURL(pendingPreview.value)
  pendingPreview.value = null
}

async function submit() {
  if (pendingImage.value) {
    emit('sendImage', pendingImage.value, text.value.trim())
    text.value = ''
    clearImage()
    await nextTick()
    autoResize()
    return
  }
  const t = text.value.trim()
  if (!t) return
  emit('send', t)
  text.value = ''
  await nextTick()
  autoResize()
}

function onKeydown(e: KeyboardEvent) {
  const isComposing = (e as KeyboardEvent & { isComposing?: boolean }).isComposing
  if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
    e.preventDefault()
    submit()
  }
}
</script>

<template>
  <div class="bg-black/80 rounded-2xl border border-white/10 p-2 flex flex-col gap-2">
    <div v-if="pendingPreview" class="relative inline-block w-fit">
      <img :src="pendingPreview" class="max-h-32 rounded-xl border border-white/10" />
      <button
        type="button"
        class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center text-white"
        @click="clearImage"
      >
        <UIcon name="i-ion-close" class="text-sm" />
      </button>
    </div>

    <div class="flex items-end gap-2">
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
      <button
        type="button"
        class="shrink-0 text-gray-400 hover:text-white p-2"
        @click="onPickFile"
      >
        <UIcon name="i-ion-attach" class="text-xl" />
      </button>

      <textarea
        ref="textareaRef"
        v-model="text"
        rows="1"
        :placeholder="pendingImage ? 'Подпись (необязательно)' : 'Напишите сообщение...'"
        class="flex-1 bg-transparent resize-none outline-none min-h-0 placeholder:text-gray-400 text-white p-2"
        @keydown="onKeydown"
      />

      <div class="flex items-end shrink-0">
        <button
          type="button"
          class="bg-white text-black rounded-full px-4 py-2"
          @click="submit"
        >Отправить</button>
      </div>
    </div>
  </div>
</template>
