import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

import { getSkydropxConfig } from './skydropx.config'
import { SkydropxWebhookError } from './skydropx.errors'

export type SkydropxWebhookVerifyInput = {
  rawBody: string
  headers: Headers
  requestUrl: string
}

function readHeader(headers: Headers, names: string[]): string | null {
  for (const name of names) {
    const value = headers.get(name)
    if (value?.trim()) return value.trim()
  }
  return null
}

function verifyHmacSignature(rawBody: string, secret: string, authorization: string): boolean {
  const prefix = 'HMAC '
  if (!authorization.startsWith(prefix)) return false

  const provided = authorization.slice(prefix.length).trim().toLowerCase()
  const expected = createHmac('sha512', secret).update(rawBody, 'utf8').digest('hex')

  try {
    const providedBuf = Buffer.from(provided, 'utf8')
    const expectedBuf = Buffer.from(expected, 'utf8')
    if (providedBuf.length !== expectedBuf.length) return false
    return timingSafeEqual(providedBuf, expectedBuf)
  } catch {
    return false
  }
}

function verifyBearerToken(authorization: string, secret: string): boolean {
  const prefix = 'Bearer '
  if (!authorization.startsWith(prefix)) return false
  const token = authorization.slice(prefix.length).trim()
  return token.length > 0 && token === secret
}

function verifyQuerySecret(requestUrl: string, secret: string): boolean {
  try {
    const url = new URL(requestUrl)
    const querySecret = url.searchParams.get('secret')?.trim()
    return Boolean(querySecret && querySecret === secret)
  } catch {
    return false
  }
}

/**
 * Validates Skydropx webhook authenticity (HMAC, Bearer, header secret, or query secret).
 *
 * @throws SkydropxWebhookError when verification fails in strict mode.
 */
export function verifySkydropxWebhookRequest(input: SkydropxWebhookVerifyInput): void {
  const { webhookSecret } = getSkydropxConfig()
  const isProduction = process.env.NODE_ENV === 'production'

  if (!webhookSecret) {
    if (isProduction) {
      throw new SkydropxWebhookError(
        'SKYDROPX_WEBHOOK_SECRET no configurado en producción.',
        'SKYDROPX_WEBHOOK_UNCONFIGURED',
      )
    }
    console.warn(
      '[skydropx-webhook] SKYDROPX_WEBHOOK_SECRET vacío — aceptando webhook sin verificación (solo desarrollo).',
    )
    return
  }

  const authorization = readHeader(input.headers, ['authorization']) ?? ''
  const headerSecret = readHeader(input.headers, [
    'x-skydropx-webhook-secret',
    'x-webhook-secret',
    'x-skydropx-secret',
  ])

  const verified =
    verifyHmacSignature(input.rawBody, webhookSecret, authorization) ||
    verifyBearerToken(authorization, webhookSecret) ||
    (headerSecret !== null && headerSecret === webhookSecret) ||
    verifyQuerySecret(input.requestUrl, webhookSecret)

  if (!verified) {
    throw new SkydropxWebhookError(
      'Webhook Skydropx no autorizado.',
      'SKYDROPX_WEBHOOK_UNAUTHORIZED',
    )
  }
}
