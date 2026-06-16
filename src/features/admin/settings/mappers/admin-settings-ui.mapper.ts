const EMAIL_PROVIDER_LABELS: Record<string, string> = {
  console: 'Consola (desarrollo)',
  resend: 'Resend',
  mailtrap: 'Mailtrap',
}

export function mapEmailProviderToLabel(provider: string): string {
  return EMAIL_PROVIDER_LABELS[provider.toLowerCase()] ?? provider
}

export function formatPackageDimensions(input: {
  lengthCm: number
  widthCm: number
  heightCm: number
  weightKg: number
}): string {
  return `${input.lengthCm} × ${input.widthCm} × ${input.heightCm} cm · ${input.weightKg} kg`
}

export function mapSkydropxEnvToLabel(env: string): string {
  const normalized = env.toLowerCase()
  if (normalized === 'sandbox') return 'Sandbox'
  if (normalized === 'production' || normalized === 'prod') return 'Producción'
  return env
}
