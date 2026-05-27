import 'server-only'

import type { SkydropxApiError } from './skydropx.errors'
import { sanitizeSkydropxDebugPayload } from './skydropx.sanitize'

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

/**
 * Collects nested Skydropx field errors, e.g. errors.address_from.reference[].
 */
export function extractSkydropxNestedFieldErrors(parsed: unknown): string[] {
  const messages: string[] = []
  const root = asRecord(parsed)
  if (!root) return messages

  const errorsNode = root.errors
  if (!errorsNode || typeof errorsNode !== 'object') return messages

  function walk(node: unknown, path: string): void {
    if (Array.isArray(node)) {
      for (const item of node) {
        if (typeof item === 'string' && item.trim()) {
          messages.push(path ? `${path}: ${item}` : item)
        }
      }
      return
    }
    const record = asRecord(node)
    if (!record) return
    for (const [key, value] of Object.entries(record)) {
      walk(value, path ? `${path}.${key}` : key)
    }
  }

  walk(errorsNode, '')
  return messages
}

function extractSkydropxErrorDetails(parsed: unknown): string[] {
  const messages: string[] = []
  const root = asRecord(parsed)
  if (!root) return messages

  const topMessage = root.message
  if (typeof topMessage === 'string' && topMessage.trim()) {
    messages.push(topMessage.trim())
  }

  messages.push(...extractSkydropxNestedFieldErrors(parsed))

  const errors = root.errors
  if (Array.isArray(errors)) {
    for (const item of errors) {
      if (typeof item === 'string') {
        messages.push(item)
        continue
      }
      const record = asRecord(item)
      if (!record) continue
      const msg =
        (typeof record.message === 'string' && record.message) ||
        (typeof record.detail === 'string' && record.detail) ||
        (typeof record.title === 'string' && record.title)
      if (msg) messages.push(msg)
    }
  }

  return messages
}

function collectErrorText(error: SkydropxApiError): string {
  const parts: string[] = [error.message]
  const body = error.sanitizedBody ?? error.details
  if (body && typeof body === 'object') {
    parts.push(...extractSkydropxErrorDetails(body))
    try {
      parts.push(JSON.stringify(sanitizeSkydropxDebugPayload(body)))
    } catch {
      // ignore
    }
  }
  return parts.join(' ').toLowerCase()
}

function mentionsCreditsOrCarrier(text: string): boolean {
  return (
    text.includes('credit') ||
    text.includes('crédito') ||
    text.includes('saldo') ||
    text.includes('balance') ||
    text.includes('carrier') ||
    text.includes('paqueter') ||
    text.includes('servicio no habilitado')
  )
}

function mentionsPhone(text: string): boolean {
  return text.includes('phone') || text.includes('teléfono') || text.includes('telefono')
}

function mentionsPostal(text: string): boolean {
  return (
    text.includes('postal') ||
    text.includes('zip') ||
    text.includes('código postal') ||
    text.includes('codigo postal')
  )
}

function mentionsReference(text: string): boolean {
  return text.includes('reference') || text.includes('referencia')
}

/**
 * Maps Skydropx HTTP errors to checkout quote Spanish copy.
 */
export function getSkydropxQuoteUserMessage(error: SkydropxApiError): string {
  const text = collectErrorText(error)

  if (mentionsCreditsOrCarrier(text)) {
    return 'Revisa saldo o servicios habilitados en Skydropx.'
  }

  if (error.status === 422 || error.status === 400) {
    if (mentionsReference(text) && text.includes('largo')) {
      return 'La referencia de origen es demasiado larga (máximo 30 caracteres). Ajusta SHIPPING_ORIGIN_REFERENCE.'
    }
    if (mentionsPhone(text)) {
      return 'El teléfono de origen debe tener 10 dígitos (sin +52).'
    }
    if (mentionsPostal(text)) {
      return 'El código postal debe tener 5 dígitos.'
    }
    return 'No pudimos cotizar el envío con esos datos. Revisa código postal, ciudad, estado y paquete.'
  }

  switch (error.status) {
    case 502:
    case 503:
    case 504:
      return 'No pudimos cotizar el envío en este momento. Intenta de nuevo en unos minutos.'
    case 401:
    case 403:
      return 'No pudimos autenticar con Skydropx. Revisa las credenciales.'
    case 402:
      return 'Revisa saldo o servicios habilitados en Skydropx.'
    default:
      return 'No pudimos cotizar el envío. Intenta de nuevo.'
  }
}

/**
 * Maps Skydropx HTTP errors to admin label Spanish copy.
 */
export function getSkydropxUserMessage(error: SkydropxApiError): string {
  const text = collectErrorText(error)

  if (mentionsCreditsOrCarrier(text)) {
    return 'Revisa saldo o servicios habilitados en Skydropx.'
  }

  if (error.status === 422) {
    if (mentionsReference(text) && text.includes('largo')) {
      return 'La referencia de origen es demasiado larga (máximo 30 caracteres). Ajusta SHIPPING_ORIGIN_REFERENCE.'
    }
    if (mentionsPhone(text)) {
      return 'Los datos de envío no son válidos. El teléfono debe tener 10 dígitos (sin +52).'
    }
    if (mentionsPostal(text)) {
      return 'Los datos de envío no son válidos. El código postal debe tener 5 dígitos.'
    }
    return 'Los datos de envío no son válidos. Revisa dirección, teléfono y código postal.'
  }

  switch (error.status) {
    case 502:
    case 503:
    case 504:
      return 'Skydropx no pudo generar la guía en este momento. Intenta nuevamente en unos minutos.'
    case 400:
      return 'Los datos de envío no son válidos. Revisa dirección, teléfono y código postal.'
    case 401:
    case 403:
      return 'No pudimos autenticar con Skydropx. Revisa las credenciales.'
    case 402:
      return 'Revisa saldo o servicios habilitados en Skydropx.'
    case 409:
      return 'La guía ya fue generada o la tarifa no está disponible.'
    default:
      return 'No se pudo completar la operación con Skydropx.'
  }
}
