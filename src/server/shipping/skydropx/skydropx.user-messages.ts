import 'server-only'

import type { SkydropxApiError } from './skydropx.errors'
import { sanitizeSkydropxDebugPayload } from './skydropx.sanitize'

function collectErrorText(error: SkydropxApiError): string {
  const parts: string[] = [error.message]
  const body = error.sanitizedBody ?? error.details
  if (body && typeof body === 'object') {
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

/**
 * Maps Skydropx HTTP errors to admin-safe Spanish copy (no raw payload).
 */
export function getSkydropxUserMessage(error: SkydropxApiError): string {
  const text = collectErrorText(error)

  if (mentionsCreditsOrCarrier(text)) {
    return 'Revisa saldo o servicios habilitados en Skydropx.'
  }

  switch (error.status) {
    case 502:
    case 503:
    case 504:
      return 'Skydropx no pudo generar la guía en este momento. Intenta nuevamente en unos minutos.'
    case 400:
    case 422:
      return 'Los datos de envío no son válidos. Revisa dirección, teléfono y código postal.'
    case 401:
    case 403:
      return 'No pudimos autenticar con Skydropx. Revisa las credenciales.'
    case 402:
      return 'Revisa saldo o servicios habilitados en Skydropx.'
    case 409:
      return 'La guía ya fue generada o la tarifa no está disponible.'
    default:
      return error.message || 'No se pudo completar la operación con Skydropx.'
  }
}
