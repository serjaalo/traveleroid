<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Profile } from '~/types/photo'

const props = defineProps<{
  modelValue: boolean
  profile: Profile
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'updated', profile: Partial<Profile>): void
}>()

const name = ref(props.profile.name)
const bio = ref(props.profile.bio)
const avatarPreview = ref<string>(props.profile.avatar)
const pendingAvatar = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const errorMessage = ref('')

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      name.value = props.profile.name
      bio.value = props.profile.bio
      avatarPreview.value = props.profile.avatar
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
    const updates: { name?: string; bio?: string; avatar?: string } = {}
    let avatar = props.profile.avatar

    if (pendingAvatar.value) {
      const fd = new FormData()
      fd.append('photo', pendingAvatar.value)
      const r = await $fetch<{ avatar: string }>('/api/user/avatar', {
        method: 'POST',
        body: fd
      })
      avatar = r.avatar
    }

    if (name.value.trim() && name.value.trim() !== props.profile.name) {
      updates.name = name.value.trim()
    }
    if (bio.value !== props.profile.bio) {
      updates.bio = bio.value
    }

    let updatedProfile: Partial<Profile> = { avatar }
    if (Object.keys(updates).length) {
      const r = await $fetch<{ name: string; bio: string; avatar: string; username: string }>(
        '/api/user/profile',
        { method: 'PATCH', body: updates }
      )
      updatedProfile = { ...updatedProfile, name: r.name, bio: r.bio, username: r.username }
    }

    emit('updated', updatedProfile)
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
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 bg-black/70 backdrop-blur overflow-y-auto"
      @click.self="close"
    >
      <div class="w-full max-w-md bg-[#0b0b0b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base sm:text-lg font-semibold text-white">Редактировать профиль</h3>
          <button class="text-gray-400 hover:text-white p-1" @click="close">
            <UIcon name="i-ion-close" class="text-xl" />
          </button>
        </div>

        <!-- Avatar -->
        <div class="flex flex-col items-center mb-5 sm:mb-6">
          <button type="button" class="relative group" @click="onPickFile">
            <img :src="avatarPreview" class="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border border-white/10" />
            <div class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <UIcon name="i-ion-camera" class="text-white text-2xl" />
            </div>
          </button>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
          <button type="button" class="mt-2 text-xs text-gray-400 hover:text-white" @click="onPickFile">
            Изменить аватар
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-400">Имя</label>
            <input
              v-model="name"
              type="text"
              class="mt-1 w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label class="text-xs text-gray-400">О себе</label>
            <textarea
              v-model="bio"
              rows="3"
              class="mt-1 w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 resize-none"
              placeholder="Несколько слов о себе"
            />
          </div>
        </div>

        <p v-if="errorMessage" class="text-sm text-red-400 mt-3">{{ errorMessage }}</p>

        <div class="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-sm bg-white/5 hover:bg-white/10 text-white"
            @click="close"
          >Отмена</button>
          <button
            type="button"
            :disabled="busy"
            class="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50"
            @click="save"
          >{{ busy ? 'Сохранение...' : 'Сохранить' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
