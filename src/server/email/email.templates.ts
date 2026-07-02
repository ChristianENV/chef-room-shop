import 'server-only'

import { CHEF_ROOM_LOGO_SRC } from '@/lib/brand'
import { BRAND_VARS } from '@/src/config/vars'
import { getAppBaseUrl } from '@/src/server/payments/app-url'
import { USER_INVITATION_TTL_DAYS } from '@/src/server/invitations/user-invitation.constants'

import type {
  RenderedEmail,
  TransactionalEmailPayload,
  TransactionalEmailTemplate,
} from './email.types'

const BRAND_COLOR = BRAND_VARS.primaryColor
const BRAND_NAME = BRAND_VARS.name

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
  const logoUrl = `${getAppBaseUrl()}${CHEF_ROOM_LOGO_SRC}`
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>${BRAND_NAME}</title></head>
<body style="margin:0;padding:24px;font-family:Georgia,serif;background:#f8f9fc;color:#1a1a2e;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:32px;">
    <p style="margin:0 0 24px;">
      <img src="${logoUrl}" alt="${BRAND_NAME}" width="220" height="51" style="display:block;width:220px;height:auto;max-width:100%;" />
    </p>
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
      trackingNote: 'Crea tu cuenta para consultar el estado y seguimiento de tu pedido.',
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

    case 'shipping_update': {
      const carrier = payload.carrier ?? 'tu paquetería'
      const trackingNumber = payload.trackingNumber ?? '—'
      const subject = `Tu pedido ${orderNumber} va en camino`
      const text = `Hola,\n\nActualizamos el estado de envío de tu pedido ${orderNumber}.\n\nPaquetería: ${carrier}\nGuía: ${trackingNumber}\n\n${tracking.trackingNote}\n${tracking.href}\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p>Actualizamos el estado de envío de tu pedido <strong>${orderNumber}</strong>.</p>
        <p><strong>Paquetería:</strong> ${carrier}<br><strong>Número de guía:</strong> <span style="font-family:monospace;">${trackingNumber}</span></p>
        ${tracking.trackingNote ? `<p style="font-size:14px;color:#6b7280;">${tracking.trackingNote}</p>` : ''}
        ${cta(tracking.href, tracking.label)}
      `)
      return { subject, html, text }
    }

    case 'delivered': {
      const subject = `Tu pedido ${orderNumber} fue entregado`
      const text = `Hola,\n\nTu pedido ${orderNumber} fue marcado como entregado.\n\n${tracking.trackingNote}\n${tracking.href}\n\nSi tienes dudas, contáctanos desde tu cuenta.\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p>Tu pedido <strong>${orderNumber}</strong> fue marcado como entregado.</p>
        <p>Gracias por confiar en Chef Room.</p>
        ${tracking.trackingNote ? `<p style="font-size:14px;color:#6b7280;">${tracking.trackingNote}</p>` : ''}
        ${cta(tracking.href, tracking.label)}
        ${cta(shopUrl, 'Seguir comprando')}
      `)
      return { subject, html, text }
    }

    case 'email_verification': {
      const verifyUrl = payload.verificationUrl ?? '#'
      const subject = 'Verifica tu correo en Chef Room'
      const text = `Hola,\n\nNecesitamos confirmar tu correo para proteger la información de tus pedidos.\n\nVerifica aquí: ${verifyUrl}\n\nEste enlace expira en un tiempo limitado por seguridad.\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p>Necesitamos confirmar tu correo para proteger la información de tus pedidos.</p>
        ${cta(verifyUrl, 'Verificar correo')}
        <p style="font-size:14px;color:#6b7280;">Este enlace expira en un tiempo limitado por seguridad. Si no solicitaste esta verificación, puedes ignorar este mensaje.</p>
      `)
      return { subject, html, text }
    }

    case 'password_reset': {
      const resetUrl = payload.resetPasswordUrl ?? '#'
      const subject = 'Restablece tu contraseña de Chef Room'
      const text = `Hola,\n\nRecibimos una solicitud para restablecer la contraseña de tu cuenta Chef Room.\n\nCambia tu contraseña aquí: ${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.\n\nEste enlace estará disponible por tiempo limitado.\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <h2 style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:20px;color:#1a1a2e;">Restablece tu contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta Chef Room.</p>
        ${cta(resetUrl, 'Cambiar contraseña')}
        <p style="font-size:14px;color:#6b7280;">Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.</p>
        <p style="font-size:14px;color:#6b7280;">Este enlace estará disponible por tiempo limitado.</p>
      `)
      return { subject, html, text }
    }

    case 'order_claim_transfer_authorization': {
      const authorizeUrl = payload.claimUrl ?? payload.links?.claimUrl ?? '#'
      const requestedByEmail = payload.requestedByEmail ?? 'otra cuenta'
      const subject = `Autorización para vincular el pedido ${orderNumber}`
      const text = `Hola,\n\nRecibimos una solicitud para guardar el pedido ${orderNumber} en la cuenta ${requestedByEmail}.\n\nSi reconoces esta solicitud, autoriza la vinculación del pedido aquí: ${authorizeUrl}\n\nSi no la reconoces, puedes ignorar este correo.\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p>Recibimos una solicitud para guardar el pedido <strong>${orderNumber}</strong> en la cuenta <strong>${requestedByEmail}</strong>.</p>
        <p>Si reconoces esta solicitud, autoriza la vinculación del pedido. Si no la reconoces, puedes ignorar este correo.</p>
        ${cta(authorizeUrl, 'Autorizar vinculación del pedido')}
        <p style="font-size:14px;color:#6b7280;">Este enlace expira en 48 horas por seguridad.</p>
      `)
      return { subject, html, text }
    }

    case 'user_invitation': {
      const invitationUrl = payload.invitationUrl ?? '#'
      const targetRoleLabel = payload.targetRoleLabel ?? 'usuario'
      const invitedByName = payload.invitedByName ?? 'un administrador'
      const subject = `Invitación a Chef Room — ${targetRoleLabel}`
      const text = `Hola,\n\n${invitedByName} te invitó a unirte a Chef Room como ${targetRoleLabel}.\n\nAcepta tu invitación aquí: ${invitationUrl}\n\nEste enlace expira en ${USER_INVITATION_TTL_DAYS} días.\n\nChef Room`
      const html = layoutHtml(`
        <p>Hola,</p>
        <p><strong>${invitedByName}</strong> te invitó a unirte a Chef Room como <strong>${targetRoleLabel}</strong>.</p>
        <p>Haz clic en el botón para continuar con tu registro o acceso.</p>
        ${cta(invitationUrl, 'Aceptar invitación')}
        <p style="font-size:14px;color:#6b7280;">Este enlace expira en ${USER_INVITATION_TTL_DAYS} días. Si no esperabas esta invitación, puedes ignorar este correo.</p>
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
