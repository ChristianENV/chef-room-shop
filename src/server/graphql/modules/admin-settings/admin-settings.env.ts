/**
 * Safe environment labels for admin settings (no server-only dependencies).
 */

export function resolveAdminDeploymentLabel(): string | null {
  const vercel = process.env.VERCEL_ENV?.trim()
  if (vercel) {
    if (vercel === 'production') return 'Vercel · Producción'
    if (vercel === 'preview') return 'Vercel · Preview'
    if (vercel === 'development') return 'Vercel · Desarrollo'
    return `Vercel · ${vercel}`
  }

  const railway = process.env.RAILWAY_ENVIRONMENT?.trim()
  if (railway) return `Railway · ${railway}`

  return null
}

export function resolveAdminEnvironmentLabel(): string {
  const vercel = process.env.VERCEL_ENV?.trim()
  if (vercel === 'production') return 'Producción'
  if (vercel === 'preview') return 'Previsualización'
  if (vercel === 'development') return 'Desarrollo'

  const node = process.env.NODE_ENV?.trim() || 'development'
  if (node === 'production') return 'Producción'
  if (node === 'test') return 'Pruebas'
  return 'Desarrollo'
}
