import 'server-only'

const DEFAULT_API_BASE = 'https://api-pro.skydropx.com'

/**
 * Skydropx PRO server configuration (lazy — missing keys do not break build).
 */
export function getSkydropxConfig() {
  return {
    env: process.env.SKYDROPX_ENV?.trim() || 'sandbox',
    apiBaseUrl: process.env.SKYDROPX_API_BASE_URL?.trim() || DEFAULT_API_BASE,
    clientId: process.env.SKYDROPX_CLIENT_ID?.trim() ?? '',
    clientSecret: process.env.SKYDROPX_CLIENT_SECRET?.trim() ?? '',
    webhookSecret: process.env.SKYDROPX_WEBHOOK_SECRET?.trim() ?? '',
  }
}

/**
 * Returns true when OAuth client credentials are configured.
 */
export function isSkydropxConfigured(): boolean {
  const { clientId, clientSecret } = getSkydropxConfig()
  return clientId.length > 0 && clientSecret.length > 0
}
