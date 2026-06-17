<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Skeleton from '~/components/common/Skeleton.vue'

definePageMeta({ layout: false })

interface Company {
  id: string
  name: string
  description: string
  avatar: string
  places: string[]
  ownerId: string | null
  createdAt: string
}
interface CompanyKey {
  key: string
  companyId: string
  used: boolean
  usedBy: string | null
  usedAt: string | null
  createdAt: string
}
interface AdminPlace {
  place: string
  postsCount: number
  reviewsCount: number
  company: { id: string; name: string } | null
  registered: boolean
}

const loggedIn = ref(false)
const password = ref('')
const loginError = ref('')
const loginBusy = ref(false)

const companies = ref<Company[]>([])
const loadingCompanies = ref(false)
const keysMap = ref<Record<string, CompanyKey[]>>({})
const expandedId = ref<string | null>(null)
const placeInputs = ref<Record<string, string>>({})

// Create form
const form = ref({ name: '', description: '', avatar: '' })
const createBusy = ref(false)
const createError = ref('')

// Places block
const places = ref<AdminPlace[]>([])
const loadingPlaces = ref(false)
const newPlace = ref('')
const createPlaceBusy = ref(false)
const placesError = ref('')
const placesExpanded = ref(true)

// Free (unattached) places — used for selector when adding to a company
const freePlaces = ref<string[]>([])

async function checkSession() {
  try {
    const r = await $fetch<{ admin: boolean }>('/api/admin/session')
    loggedIn.value = r.admin
    if (r.admin) {
      await loadCompanies()
      await loadPlaces()
    }
  } catch {
    loggedIn.value = false
  }
}

async function login() {
  loginError.value = ''
  loginBusy.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    loggedIn.value = true
    password.value = ''
    await loadCompanies()
    await loadPlaces()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    loginError.value = err?.data?.statusMessage || err?.statusMessage || 'Ошибка входа'
  } finally {
    loginBusy.value = false
  }
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
  loggedIn.value = false
  companies.value = []
  keysMap.value = {}
}

async function loadCompanies() {
  loadingCompanies.value = true
  try {
    companies.value = await $fetch<Company[]>('/api/admin/companies')
  } catch (e) {
    console.error(e)
  } finally {
    loadingCompanies.value = false
  }
}

async function loadPlaces() {
  loadingPlaces.value = true
  try {
    places.value = await $fetch<AdminPlace[]>('/api/admin/places')
  } catch (e) {
    console.error(e)
  } finally {
    loadingPlaces.value = false
  }
  await loadFreePlaces()
}

async function loadFreePlaces() {
  try {
    freePlaces.value = await $fetch<string[]>('/api/admin/places/free')
  } catch (e) {
    console.error(e)
  }
}

async function createPlace() {
  if (createPlaceBusy.value) return
  placesError.value = ''
  const value = newPlace.value.trim()
  if (!value) {
    placesError.value = 'Введите название места'
    return
  }
  createPlaceBusy.value = true
  try {
    await $fetch('/api/admin/places', {
      method: 'POST',
      body: { place: value }
    })
    newPlace.value = ''
    await loadPlaces()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    placesError.value = err?.data?.statusMessage || err?.statusMessage || 'Ошибка создания'
  } finally {
    createPlaceBusy.value = false
  }
}

async function deletePlace(place: string) {
  if (!confirm(`Удалить место "${place}"? Будут удалены связанные посты и отзывы, место также будет откреплено от компании.`)) return
  try {
    await $fetch(`/api/admin/places/${encodeURIComponent(place)}`, { method: 'DELETE' })
    await loadPlaces()
    await loadCompanies()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    alert(err?.data?.statusMessage || err?.statusMessage || 'Ошибка удаления')
  }
}

async function loadKeys(companyId: string) {
  try {
    keysMap.value[companyId] = await $fetch<CompanyKey[]>(`/api/admin/companies/${companyId}/keys`)
  } catch (e) {
    console.error(e)
  }
}

async function createCompany() {
  if (createBusy.value) return
  createError.value = ''
  if (!form.value.name.trim()) {
    createError.value = 'Имя обязательно'
    return
  }
  createBusy.value = true
  try {
    await $fetch('/api/admin/companies', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        description: form.value.description.trim(),
        places: [],
        avatar: form.value.avatar.trim() || undefined
      }
    })
    form.value = { name: '', description: '', avatar: '' }
    await loadCompanies()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    createError.value = err?.data?.statusMessage || err?.statusMessage || 'Ошибка создания'
  } finally {
    createBusy.value = false
  }
}

async function deleteCompany(id: string) {
  if (!confirm('Удалить компанию?')) return
  try {
    await $fetch(`/api/admin/companies/${id}`, { method: 'DELETE' })
    await loadCompanies()
  } catch (e) {
    console.error(e)
  }
}

async function addPlace(companyId: string) {
  const place = (placeInputs.value[companyId] || '').trim()
  if (!place) return
  try {
    await $fetch(`/api/admin/companies/${companyId}/places`, {
      method: 'POST',
      body: { place }
    })
    placeInputs.value[companyId] = ''
    await loadCompanies()
    await loadPlaces()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    alert(err?.data?.statusMessage || err?.statusMessage || 'Ошибка добавления')
  }
}

async function removePlace(companyId: string, place: string) {
  if (!confirm(`Открепить место "${place}"?`)) return
  try {
    await $fetch(`/api/admin/companies/${companyId}/places/${encodeURIComponent(place)}`, { method: 'DELETE' })
    await loadCompanies()
    await loadPlaces()
  } catch (e) {
    console.error(e)
  }
}

async function toggleKeys(id: string) {
  if (expandedId.value === id) {
    expandedId.value = null
    return
  }
  expandedId.value = id
  if (!keysMap.value[id]) {
    await loadKeys(id)
  }
}

async function generateKey(companyId: string) {
  try {
    await $fetch(`/api/admin/companies/${companyId}/keys`, { method: 'POST' })
    await loadKeys(companyId)
  } catch (e) {
    console.error(e)
  }
}

async function deleteKey(companyId: string, key: string) {
  try {
    await $fetch(`/api/admin/companies/${companyId}/keys/${key}`, { method: 'DELETE' })
    await loadKeys(companyId)
  } catch (e) {
    console.error(e)
  }
}

function copyKey(key: string) {
  navigator.clipboard?.writeText(key).catch(() => {})
}

onMounted(checkSession)
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Login screen -->
    <div v-if="!loggedIn" class="flex items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-md">
        <h1 class="text-3xl font-bold mb-6 text-center">Админ-панель</h1>
        <form @submit.prevent="login" class="bg-[#0b0b0b] border border-white/10 rounded-3xl p-8 space-y-4">
          <label class="text-sm text-gray-400">Пароль администратора</label>
          <input
            v-model="password"
            type="password"
            class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition text-sm"
            placeholder="••••••••"
            required
          />
          <p v-if="loginError" class="text-sm text-red-400">{{ loginError }}</p>
          <button
            type="submit"
            :disabled="loginBusy"
            class="w-full py-3 rounded-xl font-semibold bg-white text-black hover:bg-gray-200 transition disabled:opacity-50"
          >
            {{ loginBusy ? 'Вход...' : 'Войти' }}
          </button>
          <NuxtLink to="/" class="block text-center text-sm text-gray-400 hover:text-white">На главную</NuxtLink>
        </form>
      </div>
    </div>

    <!-- Admin panel -->
    <div v-else class="max-w-5xl mx-auto p-4 sm:p-6">
      <header class="flex items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div class="min-w-0">
          <h1 class="text-2xl sm:text-3xl font-bold">Админ-панель</h1>
          <p class="text-xs sm:text-sm text-gray-400 mt-1">Управление компаниями и ключами</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink to="/" class="px-3 py-2 rounded-xl text-xs sm:text-sm bg-[#0b0b0b] border border-white/10 hover:bg-white/5 whitespace-nowrap">На сайт</NuxtLink>
          <button @click="logout" class="px-3 py-2 rounded-xl text-xs sm:text-sm bg-[#0b0b0b] border border-white/10 hover:bg-white/5 whitespace-nowrap">Выйти</button>
        </div>
      </header>

      <!-- Create company -->
      <section class="bg-[#0b0b0b] border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Создать компанию</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="form.name" placeholder="Название*" class="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm" />
          <input v-model="form.avatar" placeholder="URL аватара (опционально)" class="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm" />
          <input v-model="form.description" placeholder="Описание" class="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm md:col-span-2" />
        </div>
        <p class="text-xs text-gray-500 mt-3">Места можно прикрепить позже — выбрав из существующих в разделе «Управление» компании.</p>
        <p v-if="createError" class="text-sm text-red-400 mt-2">{{ createError }}</p>
        <div class="mt-4">
          <button
            @click="createCompany"
            :disabled="createBusy"
            class="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50"
          >
            {{ createBusy ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </section>

      <!-- Places block -->
      <section class="bg-[#0b0b0b] border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
        <div class="flex items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4 flex-col sm:flex-row">
          <button
            type="button"
            class="flex items-center gap-2 group cursor-pointer transition active:scale-[0.98] text-left"
            @click="placesExpanded = !placesExpanded"
          >
            <UIcon
              name="i-ion-chevron-forward"
              class="size-4 text-gray-400 transition-transform duration-200"
              :class="placesExpanded ? 'rotate-90' : ''"
            />
            <div>
              <h2 class="text-base sm:text-lg font-semibold">Места <span class="text-xs text-gray-500 font-normal">({{ places.length }})</span></h2>
              <p class="text-xs text-gray-500 mt-1">Список всех известных мест: добавление и удаление</p>
            </div>
          </button>
          <button
            v-if="placesExpanded"
            @click.stop="loadPlaces"
            class="px-3 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >Обновить</button>
        </div>

        <Transition name="slide-up">
        <div v-if="placesExpanded">
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            v-model="newPlace"
            placeholder="Например: Озеро Лабынкыр"
            class="flex-1 bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm"
            @keyup.enter="createPlace"
          />
          <button
            @click="createPlace"
            :disabled="createPlaceBusy"
            class="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50"
          >
            {{ createPlaceBusy ? 'Создание...' : '+ Добавить место' }}
          </button>
        </div>
        <p v-if="placesError" class="text-sm text-red-400 mb-3">{{ placesError }}</p>

        <div v-if="loadingPlaces" class="space-y-2">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 rounded-xl bg-black/30">
            <Skeleton width="40%" height="1rem" />
            <Skeleton width="20%" height="0.875rem" />
          </div>
        </div>
        <div v-else-if="!places.length" class="text-sm text-gray-400 py-4 text-center bg-black/30 rounded-xl">
          Мест пока нет
        </div>
        <TransitionGroup v-else name="fade" tag="div" class="space-y-2">
          <div
            v-for="p in places"
            :key="p.place"
            class="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 rounded-xl bg-black/40 border border-white/5"
          >
            <NuxtLink
              :to="`/place/${encodeURIComponent(p.place)}`"
              target="_blank"
              class="text-sm text-white hover:underline flex-1 min-w-0 truncate"
            >{{ p.place }}</NuxtLink>
            <span class="text-xs text-gray-400 whitespace-nowrap">{{ p.postsCount }} постов · {{ p.reviewsCount }} отзывов</span>
            <span v-if="p.company" class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 whitespace-nowrap">
              {{ p.company.name }}
            </span>
            <span v-else class="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 whitespace-nowrap">без компании</span>
            <button
              @click="deletePlace(p.place)"
              class="text-xs text-red-300 hover:text-red-200 transition active:scale-95 whitespace-nowrap"
            >Удалить</button>
          </div>
        </TransitionGroup>
        </div>
        </Transition>
      </section>

      <!-- Companies list -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Компании</h2>
        <div v-if="loadingCompanies" class="space-y-3">
          <div v-for="i in 3" :key="i" class="bg-[#0b0b0b] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <Skeleton width="3rem" height="3rem" radius="1rem" />
            <div class="flex-1 space-y-2">
              <Skeleton width="40%" height="1rem" />
              <Skeleton width="70%" height="0.875rem" />
            </div>
          </div>
        </div>
        <div v-else-if="!companies.length" class="text-sm text-gray-400 py-6 text-center bg-[#0b0b0b] rounded-2xl border border-white/10">
          Ещё нет компаний
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="c in companies"
            :key="c.id"
            class="bg-[#0b0b0b] border border-white/10 rounded-2xl p-3 sm:p-4"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1 min-w-0">
                <img :src="c.avatar || '/img.jpg'" class="w-12 h-12 rounded-2xl object-cover shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="font-semibold truncate">{{ c.name }}</p>
                    <span v-if="c.ownerId" class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">привязана</span>
                    <span v-else class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">свободна</span>
                  </div>
                  <p v-if="c.description" class="text-xs text-gray-500 truncate">{{ c.description }}</p>
                </div>
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <button
                  @click="toggleKeys(c.id)"
                  class="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs bg-white/10 hover:bg-white/20 transition"
                >
                  {{ expandedId === c.id ? 'Скрыть' : 'Управление' }}
                </button>
                <button
                  @click="deleteCompany(c.id)"
                  class="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                >Удалить</button>
              </div>
            </div>

            <Transition name="slide-up">
            <div v-if="expandedId === c.id" class="mt-4 pt-4 border-t border-white/10 space-y-4">
              <!-- Places -->
              <div>
                <p class="text-sm font-semibold mb-2">Привязанные места</p>
                <div v-if="!c.places.length" class="text-sm text-gray-500 mb-2">Мест пока нет</div>
                <TransitionGroup name="fade" tag="div" class="flex flex-wrap gap-2 mb-2" v-else>
                  <span
                    v-for="p in c.places"
                    :key="p"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm"
                  >
                    {{ p }}
                    <button class="text-red-300 hover:text-red-200 ml-1 transition active:scale-90" @click="removePlace(c.id, p)">×</button>
                  </span>
                </TransitionGroup>
                <div class="flex gap-2">
                  <select
                    v-model="placeInputs[c.id]"
                    class="flex-1 bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="" disabled>{{ freePlaces.length ? 'Выберите место...' : 'Свободных мест нет' }}</option>
                    <option v-for="fp in freePlaces" :key="fp" :value="fp" class="bg-[#0b0b0b]">{{ fp }}</option>
                  </select>
                  <button
                    @click="addPlace(c.id)"
                    :disabled="!placeInputs[c.id]"
                    class="px-3 py-2 rounded-xl text-xs bg-white text-black font-semibold disabled:opacity-50 transition"
                  >+ Добавить</button>
                </div>
                <p v-if="!freePlaces.length" class="text-xs text-gray-500 mt-2">
                  Все места уже привязаны к компаниям. Создайте новое место в разделе «Места» выше.
                </p>
              </div>

              <!-- Keys -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-semibold">Ключи активации</p>
                  <button
                    @click="generateKey(c.id)"
                    class="px-3 py-1.5 rounded-xl text-xs bg-white text-black font-semibold hover:bg-gray-200"
                  >+ Сгенерировать ключ</button>
                </div>
                <div v-if="!(keysMap[c.id]?.length)" class="text-sm text-gray-500 py-2">Ключей пока нет</div>
                <TransitionGroup name="fade" tag="div" class="space-y-2" v-else>
                  <div
                    v-for="k in keysMap[c.id]"
                    :key="k.key"
                    class="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 rounded-xl bg-black/40 border border-white/5"
                  >
                    <code class="text-amber-300 text-xs sm:text-sm flex-1 min-w-0 break-all">{{ k.key }}</code>
                    <span v-if="k.used" class="text-xs text-gray-500">использован</span>
                    <span v-else class="text-xs text-emerald-300">активен</span>
                    <button type="button" class="text-xs text-gray-300 hover:text-white transition active:scale-95" @click="copyKey(k.key)">Копировать</button>
                    <button type="button" class="text-xs text-red-300 hover:text-red-200 transition active:scale-95" @click="deleteKey(c.id, k.key)">Удалить</button>
                  </div>
                </TransitionGroup>
              </div>
            </div>
            </Transition>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
