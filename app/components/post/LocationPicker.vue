<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const places = ref<string[]>([])
const loading = ref(true)
const loadError = ref('')
const query = ref('')
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

async function loadPlaces() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await $fetch<string[]>('/api/companies/places')
    places.value = data
  } catch {
    loadError.value = 'Не удалось загрузить список мест'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPlaces()
  document.addEventListener('click', onDocClick)
})

function onDocClick(e: MouseEvent) {
  const t = e.target as Node
  if (rootRef.value && !rootRef.value.contains(t)) {
    open.value = false
  }
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return places.value
  return places.value.filter(p => p.toLowerCase().includes(q))
})

function pick(p: string) {
  emit('update:modelValue', p)
  query.value = p
  open.value = false
}

function clear() {
  emit('update:modelValue', '')
  query.value = ''
  open.value = true
}

// Sync query with external value (e.g. when reset from outside)
watch(
  () => props.modelValue,
  (v) => {
    if (v !== query.value) query.value = v
  },
  { immediate: true }
)
</script>

<template>
  <div ref="rootRef" class="space-y-2 relative">
    <label class="text-sm font-medium text-gray-300">Местоположение</label>

    <div class="relative">
      <UIcon name="i-ion-location" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        :value="query"
        @input="query = ($event.target as HTMLInputElement).value; open = true"
        @focus="open = true"
        type="text"
        :placeholder="loading ? 'Загрузка списка мест...' : 'Выберите место из списка...'"
        class="w-full bg-[#0b0b0b] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
        :disabled="loading"
        autocomplete="off"
      />
      <button
        v-if="query"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
        @click="clear"
        aria-label="Очистить"
      >
        <UIcon name="i-ion-close" class="text-base" />
      </button>
    </div>

    <p v-if="loadError" class="text-xs text-red-400">{{ loadError }}</p>

    <Transition name="fade">
      <div
        v-if="open && !loading"
        class="absolute z-20 left-0 right-0 mt-1 bg-[#0b0b0b] border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
      >
        <div v-if="!places.length" class="text-xs text-gray-400 px-3 py-3 text-center">
          Пока нет доступных мест. Свяжитесь с администратором.
        </div>
        <div v-else-if="!filtered.length" class="text-xs text-gray-400 px-3 py-3 text-center">
          Ничего не найдено
        </div>
        <button
          v-for="p in filtered"
          :key="p"
          type="button"
          class="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
          :class="props.modelValue === p ? 'bg-white/10 text-white' : 'text-gray-200'"
          @click="pick(p)"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-ion-location" class="text-gray-500 shrink-0" />
            <span class="truncate">{{ p }}</span>
          </span>
        </button>
      </div>
    </Transition>

    <p v-if="!loading && query && !places.includes(query)" class="text-xs text-amber-400">
      Можно выбрать только место из списка
    </p>
  </div>
</template>
