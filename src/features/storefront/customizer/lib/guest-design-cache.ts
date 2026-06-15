import type { AccountDesign } from '@/src/features/storefront/account/types'

const STORAGE_KEY = 'chefroom:guest-designs'

type GuestDesignCacheEntry = {
  id: string
  name: string | null
  status: string
  previewUrl: string | null
  finalPriceCents: number
  currency: string
  createdAt: string
  updatedAt: string
  configJson: unknown
  product: AccountDesign['product']
}

function readCache(): Record<string, GuestDesignCacheEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, GuestDesignCacheEntry>
  } catch {
    return {}
  }
}

function writeCache(entries: Record<string, GuestDesignCacheEntry>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Ignore quota / private mode errors.
  }
}

/** Persists a guest-owned design snapshot for offline reload by design id. */
export function cacheGuestDesign(design: AccountDesign): void {
  const entries = readCache()
  entries[design.id] = {
    id: design.id,
    name: design.name,
    status: design.status,
    previewUrl: design.previewUrl,
    finalPriceCents: design.finalPriceCents,
    currency: design.currency,
    createdAt: design.createdAt,
    updatedAt: design.updatedAt,
    configJson: design.configJson,
    product: design.product,
  }
  writeCache(entries)
}

/** Loads a guest design from local cache when the server lookup is unavailable. */
export function loadGuestDesignFromCache(designId: string): AccountDesign | null {
  const entry = readCache()[designId]
  if (!entry) return null
  return {
    id: entry.id,
    name: entry.name,
    status: entry.status,
    previewUrl: entry.previewUrl,
    finalPriceCents: entry.finalPriceCents,
    currency: entry.currency,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    configJson: entry.configJson,
    product: entry.product,
  }
}

/** Lists guest designs cached locally, most recent first. */
export function listGuestDesigns(): AccountDesign[] {
  return Object.values(readCache()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}
