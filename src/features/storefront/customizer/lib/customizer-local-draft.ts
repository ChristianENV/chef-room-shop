export const CUSTOMIZER_DRAFT_STORAGE_KEY = 'chefroom.customizer.draft'

export type CustomizerLocalDraft = {
  productId: string
  productSlug: string
  savedAt: string
  configJson: unknown
}

function readDraft(): CustomizerLocalDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CUSTOMIZER_DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const record = parsed as Record<string, unknown>
    if (typeof record.productId !== 'string' || typeof record.productSlug !== 'string') {
      return null
    }
    if (typeof record.savedAt !== 'string') return null
    return {
      productId: record.productId,
      productSlug: record.productSlug,
      savedAt: record.savedAt,
      configJson: record.configJson ?? null,
    }
  } catch {
    return null
  }
}

export function loadCustomizerLocalDraft(productSlug?: string | null): CustomizerLocalDraft | null {
  const draft = readDraft()
  if (!draft) return null
  if (productSlug && draft.productSlug !== productSlug) return null
  return draft
}

export function saveCustomizerLocalDraft(draft: CustomizerLocalDraft): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CUSTOMIZER_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearCustomizerLocalDraft(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CUSTOMIZER_DRAFT_STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}
