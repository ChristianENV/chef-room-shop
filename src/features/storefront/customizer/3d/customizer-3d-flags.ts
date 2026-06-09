/** Force visible red debug materials on all garment meshes. */
export function isCustomizerForceDebugMaterialEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CUSTOMIZER_3D_FORCE_DEBUG_MATERIAL === 'true'
}

export function isCustomizerEnvironmentDisabled(): boolean {
  if (process.env.NEXT_PUBLIC_CUSTOMIZER_3D_DISABLE_ENVIRONMENT === 'true') return true
  if (isCustomizerForceDebugMaterialEnabled()) return true
  return process.env.NEXT_PUBLIC_CUSTOMIZER_3D_ENABLE_ENVIRONMENT !== 'true'
}

export function isCustomizerContactShadowsDisabled(): boolean {
  if (process.env.NEXT_PUBLIC_CUSTOMIZER_3D_DISABLE_CONTACT_SHADOWS === 'true') return true
  if (isCustomizerForceDebugMaterialEnabled()) return true
  return process.env.NEXT_PUBLIC_CUSTOMIZER_3D_ENABLE_CONTACT_SHADOWS !== 'true'
}

export function isCustomizer3dSafeModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CUSTOMIZER_3D_SAFE_MODE === 'true'
}

export function isCustomizer3dDebugHudEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D === 'true'
  )
}
