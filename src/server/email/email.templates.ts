import 'server-only'

import type {
  RenderedEmail,
  TransactionalEmailPayload,
  TransactionalEmailTemplate,
} from './email.types'

const BRAND_COLOR = '#2B3280'

function formatMoney(cents: number | undefined, currency = 'MXN'): string {
  if (cents === undefined) return '—'
  const pesos = cents / 100
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pesos)
}

function layoutHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Chef Room</title></head>
<body style="margin:0;padding:24px;font-family:Georgia,serif;background:#f8f9fc;color:#1a1a2e;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:32px;">
    <p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:20px;font-weight:700;color:${BRAND_COLOR};">Chef Room</p>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#6b7280;">Este es un mensaje automático. No respondas a este correo.</p>
  </div>
</body>
</html>`
}

function cta(href: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${href}" style="display:inline-block;padding:12px 24px;background:${BRAND_COLOR};color:#fff;text-decoration:none;border-radius:6px;font-family:system-ui,sans-serif;font-weight:600;">${label}</a>
  </p>`
}

function resolveTrackingCta(payload: TransactionalEmailPayload): {
  href: string
  label: string
  trackingNote: string
} {
  const claimUrl = payload.claimUrl ?? payload.links?.claimUrl
  const accountOrderUrl = payload.accountOrderUrl ?? payload.links?.accountOrderUrl
  const successUrl = payload.links?.checkoutSuccessUrl ?? '#'

  if (claimUrl) {
    return {
      href: claimUrl,
      label: 'Ver seguimiento de mi pedido',
      trackingNote:
        'Crea tu cuenta para consultar el estado y seguimiento de tu pedido.',
    }
  }

  if (accountOrderUrl) {
    return {
      href: accountOrderUrl,
      label: 'Ver mi pedido',
      trackingNote: 'Consulta el estado de tu pedido desde tu cuenta.',
    }
  }

  return {
    href: successUrl,
    label: 'Ver pedido',
    trackingNote: '',
  }
}

/**
 * Builds subject + HTML + plain text for a transactional template.
 */
export function renderTransactionalTemplate(
  templateKey: TransactionalEmailTemplate,
  payload: TransactionalEmailPayload,
): RenderedEmail {
  const orderNumber = payload.orderNumber ?? '—'
  const total = formatMoney(payload.totalCents, payload.currency)
  const successUrl = payload.links?.checkoutSuccessUrl ?? '#'
  const shopUrl = payload.links?.shopUrl ?? '#'
  const tracking = resolveTrackingCta(payload)

  switch (templateKey) {
    case 'order_created': {
      const subject = `Recibimos tu pedido ${orderNumber}`
      const text = `Hola,\n\nRecibimos tu pedido ${orderNumber}.\nTotal: ${total}\nEstado: pendiente de pago.\n\nCompleta tu pago aquí: ${successUrl}\n\n${tracking.trackingNote}\n${tracking.href}\n\nGracias por comprar en Chef Room.`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p>Recibimos tu pedido <strong>${orderNumber}</strong>.</p>
        <p><strong>Total:</strong> ${total}<br><strong>Estado:</strong> pendiente de pago</p>
        <p>Para iniciar producción, completa el pago en el siguiente enlace.</p>
        ${cta(successUrl, 'Completar pago')}
        ${tracking.trackingNote ? `<p style="font-size:14px;color:#6b7280;">${tracking.trackingNote}</p>` : ''}
        ${cta(tracking.href, tracking.label)}
        <p style="font-size:14px;color:#6b7280;">Si ya pagaste, ignora este mensaje; actualizaremos tu pedido en breve.</p>
      `)
      return { subject, html, text }
    }

    case 'payment_confirmed': {
      const subject = `Pago confirmado para tu pedido ${orderNumber}`
      const text = `Hola,\n\nConfirmamos el pago de tu pedido ${orderNumber}.\nTotal: ${total}\n\n${tracking.trackingNote}\n${tracking.href}\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p>Confirmamos el pago de tu pedido <strong>${orderNumber}</strong>.</p>
        <p><strong>Total:</strong> ${total}</p>
        <p>Tu pedido avanzará a producción. Te avisaremos cuando haya novedades.</p>
        ${tracking.trackingNote ? `<p style="font-size:14px;color:#6b7280;">${tracking.trackingNote}</p>` : ''}
        ${cta(tracking.href, tracking.label)}
        ${cta(shopUrl, 'Seguir comprando')}
      `)
      return { subject, html, text }
    }

    case 'payment_failed': {
      const subject = `No pudimos confirmar el pago de tu pedido ${orderNumber}`
      const text = `Hola,\n\nNo pudimos confirmar el pago del pedido ${orderNumber}.\n\nPuedes intentar de nuevo aquí: ${successUrl}\n\n${tracking.trackingNote}\n${tracking.href}\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p>No pudimos confirmar el pago de tu pedido <strong>${orderNumber}</strong>.</p>
        <p>Puedes intentar nuevamente desde el enlace de tu pedido.</p>
        ${cta(successUrl, 'Reintentar pago')}
        ${tracking.trackingNote ? `<p style="font-size:14px;color:#6b7280;">${tracking.trackingNote}</p>` : ''}
        ${cta(tracking.href, tracking.label)}
      `)
      return { subject, html, text }
    }

    case 'payment_expired': {
      const subject = `Tu referencia de pago expiró para el pedido ${orderNumber}`
      const text = `Hola,\n\nLa referencia o sesión de pago del pedido ${orderNumber} expiró.\n\nGenera un nuevo intento aquí: ${successUrl}\n\n${tracking.trackingNote}\n${tracking.href}\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p>La referencia o sesión de pago de tu pedido <strong>${orderNumber}</strong> expiró.</p>
        <p>Genera un nuevo intento de pago cuando estés listo.</p>
        ${cta(successUrl, 'Generar nuevo pago')}
        ${tracking.trackingNote ? `<p style="font-size:14px;color:#6b7280;">${tracking.trackingNote}</p>` : ''}
        ${cta(tracking.href, tracking.label)}
      `)
      return { subject, html, text }
    }
  }
}

/**
 * Default subject when caller passes empty subject (uses template rules).
 */
export function resolveEmailSubject(
  templateKey: TransactionalEmailTemplate,
  payload: TransactionalEmailPayload,
  subjectOverride: string,
): string {
  if (subjectOverride.trim()) return subjectOverride.trim()
  return renderTransactionalTemplate(templateKey, payload).subject
}
