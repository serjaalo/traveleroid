import type { CompanyKeyRecord, CompanyRecord } from '../types'
import { newId, nowIso } from './id'

function companyStore() {
  return useStorage('companies')
}
function keyStore() {
  return useStorage('companyKeys')
}
function indexStore() {
  return useStorage('indexes')
}

// Indexes:
//   companyplace:<place> -> companyId  (place can belong to only one company)
//   companyowner:<userId> -> companyId

function placeKey(place: string) {
  return `companyplace:${place}`
}
function ownerKey(userId: string) {
  return `companyowner:${userId}`
}

export async function listCompanies(): Promise<CompanyRecord[]> {
  const keys = await companyStore().getKeys('company:')
  const items: CompanyRecord[] = []
  for (const k of keys) {
    const c = await companyStore().getItem<CompanyRecord>(k)
    if (c) items.push(normalize(c))
  }
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items
}

function normalize(c: CompanyRecord & { place?: string }): CompanyRecord {
  // Backward compat: legacy records with `place` instead of `places`
  if (!Array.isArray(c.places)) {
    c.places = c.place ? [c.place] : []
  }
  return c
}

export async function getCompany(id: string): Promise<CompanyRecord | null> {
  const c = await companyStore().getItem<CompanyRecord>(`company:${id}`)
  return c ? normalize(c) : null
}

export async function getCompanyByPlace(place: string): Promise<CompanyRecord | null> {
  const id = await indexStore().getItem<string>(placeKey(place))
  if (!id) return null
  return getCompany(id)
}

export async function getCompanyByOwner(userId: string): Promise<CompanyRecord | null> {
  const id = await indexStore().getItem<string>(ownerKey(userId))
  if (id) {
    const c = await getCompany(id)
    if (c) return c
  }
  // fallback scan
  const all = await listCompanies()
  return all.find(c => c.ownerId === userId) || null
}

async function rebuildPlaceIndex(c: CompanyRecord): Promise<void> {
  for (const p of c.places) {
    await indexStore().setItem(placeKey(p), c.id)
  }
}

export async function saveCompany(c: CompanyRecord): Promise<void> {
  await companyStore().setItem(`company:${c.id}`, c)
  await rebuildPlaceIndex(c)
  if (c.ownerId) {
    await indexStore().setItem(ownerKey(c.ownerId), c.id)
  }
}

export async function createCompany(input: {
  name: string
  description?: string
  avatar?: string
  places?: string[]
}): Promise<CompanyRecord> {
  const places = (input.places || []).map(s => s.trim()).filter(Boolean)
  // make sure none of the places is already taken
  for (const p of places) {
    const exId = await indexStore().getItem<string>(placeKey(p))
    if (exId) {
      throw createError({ statusCode: 409, statusMessage: `Place "${p}" is already attached to another company` })
    }
  }
  const c: CompanyRecord = {
    id: newId(),
    name: input.name,
    description: input.description || '',
    avatar: input.avatar || '/img.jpg',
    places,
    ownerId: null,
    createdAt: nowIso()
  }
  await saveCompany(c)
  return c
}

export async function deleteCompany(id: string): Promise<void> {
  const c = await getCompany(id)
  if (!c) return
  await companyStore().removeItem(`company:${id}`)
  for (const p of c.places) await indexStore().removeItem(placeKey(p))
  if (c.ownerId) await indexStore().removeItem(ownerKey(c.ownerId))
  // remove related keys
  const keys = await keyStore().getKeys(`key:${id}:`)
  for (const k of keys) await keyStore().removeItem(k)
}

export async function addPlaceToCompany(companyId: string, place: string): Promise<CompanyRecord> {
  const trimmed = place.trim()
  if (!trimmed) throw createError({ statusCode: 400, statusMessage: 'Place is empty' })
  const c = await getCompany(companyId)
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  if (c.places.includes(trimmed)) return c
  const occupiedBy = await indexStore().getItem<string>(placeKey(trimmed))
  if (occupiedBy && occupiedBy !== companyId) {
    throw createError({ statusCode: 409, statusMessage: 'Place already attached to another company' })
  }
  c.places = [...c.places, trimmed]
  await saveCompany(c)
  return c
}

export async function removePlaceFromCompany(companyId: string, place: string): Promise<CompanyRecord> {
  const c = await getCompany(companyId)
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  c.places = c.places.filter(p => p !== place)
  await companyStore().setItem(`company:${c.id}`, c)
  await indexStore().removeItem(placeKey(place))
  return c
}

// Keys ----------------------------------------------------------------

function generateKey(): string {
  return [...crypto.getRandomValues(new Uint8Array(8))]
    .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

export async function createCompanyKey(companyId: string): Promise<CompanyKeyRecord> {
  const rec: CompanyKeyRecord = {
    key: generateKey(),
    companyId,
    used: false,
    usedBy: null,
    usedAt: null,
    createdAt: nowIso()
  }
  await keyStore().setItem(`key:${companyId}:${rec.key}`, rec)
  await indexStore().setItem(`companykey:${rec.key}`, companyId)
  return rec
}

export async function listCompanyKeys(companyId: string): Promise<CompanyKeyRecord[]> {
  const keys = await keyStore().getKeys(`key:${companyId}:`)
  const items: CompanyKeyRecord[] = []
  for (const k of keys) {
    const v = await keyStore().getItem<CompanyKeyRecord>(k)
    if (v) items.push(v)
  }
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items
}

export async function findKey(key: string): Promise<CompanyKeyRecord | null> {
  const companyId = await indexStore().getItem<string>(`companykey:${key}`)
  if (!companyId) return null
  return (await keyStore().getItem<CompanyKeyRecord>(`key:${companyId}:${key}`)) || null
}

export async function consumeKey(key: string, userId: string): Promise<CompanyRecord> {
  const k = await findKey(key)
  if (!k) throw createError({ statusCode: 404, statusMessage: 'Invalid key' })
  if (k.used) throw createError({ statusCode: 409, statusMessage: 'Key already used' })
  const company = await getCompany(k.companyId)
  if (!company) throw createError({ statusCode: 404, statusMessage: 'Company missing' })
  if (company.ownerId) throw createError({ statusCode: 409, statusMessage: 'Company already claimed' })

  // Make sure user doesn't already own a company
  const existing = await getCompanyByOwner(userId)
  if (existing) throw createError({ statusCode: 409, statusMessage: 'You already own a company' })

  k.used = true
  k.usedBy = userId
  k.usedAt = nowIso()
  await keyStore().setItem(`key:${company.id}:${k.key}`, k)

  company.ownerId = userId
  await saveCompany(company)
  return company
}

export async function deleteCompanyKey(companyId: string, key: string): Promise<void> {
  await keyStore().removeItem(`key:${companyId}:${key}`)
  await indexStore().removeItem(`companykey:${key}`)
}
