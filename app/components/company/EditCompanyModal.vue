<script setup lang="ts">
import { ref, watch } from 'vue'

interface CompanyEditable {
  id: string
  name: string
  description: string
  avatar: string
}

const props = defineProps<{
  modelValue: boolean
  company: CompanyEditable
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'updated', company: Partial<CompanyEditable>): void
}>()

const name = ref(props.company.name)
const description = ref(props.company.description)
const avatarPreview = ref<string>(props.company.avatar || '/img.jpg')
const pendingAvatar = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const errorMessage = ref('')

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      name.value = props.company.name
      description.value = props.company.description
      avatarPreview.value = props.company.avatar || '/img.jpg'
      pendingAvatar.value = null
      errorMessage.value = ''
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

function onPickFile() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (file) {
    pendingAvatar.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
  input.value = ''
}

async function save() {
  busy.value = true
  errorMessage.value = ''
  try {
    const updates: { name?: string; description?: string } = {}
    let avatar = props.company.avatar

    if (pendingAvatar.value) {
      const fd = new FormData()
      fd.append('photo', pendingAvatar.value)
      const r = await $fetch<{ avatar: string }>(`/api/companies/${props.company.id}/avatar`, {
        method: 'POST',
        body: fd
      })
      avatar = r.avatar
    }

    if (name.value.trim() && name.value.trim() !== props.company.name) {
      updates.name = name.value.trim()
    }
    if (description.value !== props.company.description) {
      updates.description = description.value
    }

    let updated: Partial<CompanyEditable> = { avatar }
    if (Object.keys(updates).length) {
      const r = await $fetch<CompanyEditable>(`/api/companies/${props.company.id}`, {
        method: 'PATCH',
        body: updates
      })
      updated = { ...updated, name: r.name, description: r.description }
    }

    emit('updated', updated)
    close()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    errorMessage.value = err?.data?.statusMessage || err?.statusMessage || 'Ошибка сохранения'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="props.modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 bg-black/70 backdrop-blur overflow-y-auto"
        @click.self="close"
      >
        <Transition name="slide-up" appear>
          <div
            v-if="props.modelValue"
            class="w-full max-w-md bg-[#0b0b0b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[95vh] overflow-y-auto"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base sm:text-lg font-semibold text-white">Редактировать компанию</h3>
              <button class="text-gray-400 hover:text-white p-1 transition active:scale-90" @click="close">
                <UIcon name="i-ion-close" class="text-xl" />
              </button>
            </div>

            <!-- Avatar -->
            <div class="flex flex-col items-center mb-5 sm:mb-6">
              <button type="button" class="relative group transition active:scale-95" @click="onPickFile">
                <img :src="avatarPreview" class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-white/10 transition" />
                <div class="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <UIcon name="i-ion-camera" class="text-white text-2xl" />
                </div>
              </button>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
              <button type="button" class="mt-2 text-xs text-gray-400 hover:text-white transition" @click="onPickFile">
                Изменить аватар
              </button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-400">Название</label>
                <input
                  v-model="name"
                  type="text"
                  class="mt-1 w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition"
                  placeholder="Название компании"
                />
              </div>

              <div>
                <label class="text-xs text-gray-400">Описание</label>
                <textarea
                  v-model="description"
                  rows="3"
                  class="mt-1 w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 resize-none transition"
                  placeholder="Краткое описание услуг компании"
                />
              </div>
            </div>

            <Transition name="fade">
              <p v-if="errorMessage" class="text-sm text-red-400 mt-3">{{ errorMessage }}</p>
            </Transition>

            <div class="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl text-sm bg-white/5 hover:bg-white/10 text-white transition active:scale-95"
                @click="close"
              >Отмена</button>
              <button
                type="button"
                :disabled="busy"
                class="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50 transition active:scale-95"
                @click="save"
              >{{ busy ? 'Сохранение...' : 'Сохранить' }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
