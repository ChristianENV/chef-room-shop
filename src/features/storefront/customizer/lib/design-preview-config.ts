export type DesignPreviewRef = {
  url: string
  publicId?: string
}

export type DesignPreviewsConfig = {
  front?: DesignPreviewRef
  back?: DesignPreviewRef
}

export function readPreviewsFromConfig(configJson: unknown): DesignPreviewsConfig | null {
  if (!configJson || typeof configJson !== 'object' || Array.isArray(configJson)) {
    return null
  }
  const previews = (configJson as Record<string, unknown>).previews
  if (!previews || typeof previews !== 'object' || Array.isArray(previews)) {
    return null
  }
  const record = previews as Record<string, unknown>

  const readRef = (value: unknown): DesignPreviewRef | undefined => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
    const ref = value as Record<string, unknown>
    if (typeof ref.url !== 'string' || ref.url.length === 0) return undefined
    return {
      url: ref.url,
      publicId: typeof ref.publicId === 'string' ? ref.publicId : undefined,
    }
  }

  const front = readRef(record.front)
  const back = readRef(record.back)
  if (!front && !back) return null
  return { front, back }
}

export function hasCompleteDesignPreviews(
  previewUrl: string | null | undefined,
  configJson: unknown,
): boolean {
  if (!previewUrl) return false
  const previews = readPreviewsFromConfig(configJson)
  return Boolean(previews?.back?.url)
}
