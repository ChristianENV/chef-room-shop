import { GraphQLError } from 'graphql'

import { getActiveGuestSessionFromCookies } from '@/src/server/guest/guest-session'

import type { GraphQLContext } from '../../context'
import type { OrderWithPaymentsAndItems } from './payments.types'

function forbidden(
  message = 'No tienes permiso para iniciar el pago de este pedido.',
): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
}

function notFound(message = 'Pedido no encontrado.'): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

/**
 * Ensures the caller may start Conekta checkout for the given order.
 */
export async function assertCanStartConektaCheckout(
  context: GraphQLContext,
  order: OrderWithPaymentsAndItems,
  emailInput?: string | null,
): Promise<void> {
  const user = context.currentUser

  if (user) {
    if (order.userId && order.userId === user.id) return

    const guestSession = await getActiveGuestSessionFromCookies()
    if (guestSession && order.guestSessionId && order.guestSessionId === guestSession.id) {
      return
    }

    throw forbidden()
  }

  const email = emailInput?.trim().toLowerCase()
  if (!email) {
    throw new GraphQLError('El correo es requerido para iniciar el pago.', {
      extensions: { code: 'BAD_REQUEST' },
    })
  }

  if (order.customerEmail.toLowerCase() !== email) {
    throw forbidden()
  }

  const guestSession = await getActiveGuestSessionFromCookies()
  if (order.guestSessionId) {
    if (!guestSession || guestSession.id !== order.guestSessionId) {
      throw forbidden('Tu sesión de invitado no coincide con este pedido.')
    }
  }
}

/** Orders that may start or restart Conekta hosted checkout. */
export function assertOrderPendingPayment(order: OrderWithPaymentsAndItems): void {
  const canCheckout = order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_FAILED'

  if (!canCheckout) {
    throw new GraphQLError('Este pedido ya no admite un nuevo intento de pago.', {
      extensions: { code: 'BAD_REQUEST' },
    })
  }
}

export { notFound }
