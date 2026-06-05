export function isCustomizer3dDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D === 'true'
}

export function logCustomizer3d(event: string, payload: Record<string, unknown>): void {
  if (!isCustomizer3dDebugEnabled()) return
  console.info(`[customizer-3d] ${event}`, payload)
}
