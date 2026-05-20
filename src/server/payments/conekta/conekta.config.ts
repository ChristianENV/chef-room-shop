import 'server-only'

const DEFAULT_API_VERSION = '2.2.0'
const DEFAULT_API_BASE = 'https://api.conekta.io'

/**
 * Conekta server configuration (lazy — missing keys do not break build).
 */
export function getConektaConfig() {
  return {
    privateKey: process.env.CONEKTA_PRIVATE_KEY?.trim() ?? '',
    publicKey: process.env.NEXT_PUBLIC_CONEKTA_PUBLIC_KEY?.trim() ?? '',
    webhookSecret: process.env.CONEKTA_WEBHOOK_SECRET?.trim() ?? '',
    webhookPublicKey: process.env.CONEKTA_WEBHOOK_PUBLIC_KEY?.trim() ?? '',
    apiVersion: process.env.CONEKTA_API_VERSION?.trim() || DEFAULT_API_VERSION,
    env: process.env.CONEKTA_ENV?.trim() || 'sandbox',
    apiBaseUrl: process.env.CONEKTA_API_BASE_URL?.trim() || DEFAULT_API_BASE,
  }
}

/**
 * Returns true when a private API key is configured.
 */
export function isConektaConfigured(): boolean {
  return getConektaConfig().privateKey.length > 0
}

/**
 * Accept header required by Conekta API v2.2.
 */
export function getConektaAcceptHeader(apiVersion?: string): string {
  const version = apiVersion ?? getConektaConfig().apiVersion
  return `application/vnd.conekta-v${version}+json`
}
