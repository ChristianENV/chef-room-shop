import 'server-only'

import type { ShippingQuote, ShippingRate } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'
import { isCheckoutShippingOptionalOnServer } from './checkout-shipping-config'
import type { CheckoutOwner } from './checkout.types'

export type ShippingRateWithQuote = ShippingRate & {
  quote: ShippingQuote
}

export type ResolvedCheckoutShipping = {
  rate: ShippingRateWithQuote
  shippingCents: number
  quoteId: string
}

function checkoutShippingError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code } })
}

function quoteBelongsToOwner(
  quote: ShippingQuote,
  owner: CheckoutOwner,
): boolean {
  if (owner.userId) {
    return quote.userId === owner.userId
  }
  return quote.guestSessionId === owner.guestSessionId
}

/**
 * Resolves and validates the selected Skydropx rate for checkout (DB source of truth).
 * Never accepts amount, carrier, or dimensions from the client.
 */
export async function resolveCheckoutShippingRate(
  context: GraphQLContext,
  owner: CheckoutOwner,
  cartId: string,
  shippingRateId: string | null | undefined,
): Promise<ResolvedCheckoutShipping | null> {
  const rateId = shippingRateId?.trim()

  if (!rateId) {
    if (isCheckoutShippingOptionalOnServer()) {
      return null
    }
    throw checkoutShippingError(
      'Selecciona una opción de envío para continuar.',
      'BAD_REQUEST',
    )
  }

  const rate = await context.prisma.shippingRate.findUnique({
    where: { id: rateId },
    include: { quote: true },
  })

  if (!rate) {
    throw checkoutShippingError('Tarifa de envío no encontrada.', 'NOT_FOUND')
  }

  const { quote } = rate

  if (!quote.cartId || quote.cartId !== cartId) {
    throw checkoutShippingError(
      'No tienes acceso a esta tarifa de envío.',
      'FORBIDDEN',
    )
  }

  if (!quoteBelongsToOwner(quote, owner)) {
    throw checkoutShippingError(
      'No tienes acceso a esta tarifa de envío.',
      'FORBIDDEN',
    )
  }

  if (rate.expiresAt && rate.expiresAt <= new Date()) {
    throw checkoutShippingError(
      'La tarifa de envío expiró. Cotiza nuevamente.',
      'BAD_REQUEST',
    )
  }

  const now = new Date()
  if (!rate.selectedAt) {
    await context.prisma.$transaction([
      context.prisma.shippingRate.updateMany({
        where: { quoteId: rate.quoteId, id: { not: rate.id } },
        data: { selectedAt: null },
      }),
      context.prisma.shippingRate.update({
        where: { id: rate.id },
        data: { selectedAt: now },
      }),
    ])
  }

  return {
    rate: { ...rate, quote },
    shippingCents: rate.amountCents,
    quoteId: quote.id,
  }
}
