import { GraphQLError } from 'graphql'

import { checkoutSuccessPath } from '@/src/lib/checkout-redirect-urls'
import { getAppBaseUrl } from '@/src/server/payments/app-url'
import {
  createCheckoutReturnToken,
  validateCheckoutReturnToken,
} from '@/src/server/checkout/checkout-return-token'
import { buildOrderEmailTrackingLinks } from '@/src/server/email/email.links'

import type { GraphQLContext } from '../../context'
import { createCheckoutOrderCore, finalizeCheckoutOrderSideEffects } from './checkout.service'
import { mapOrderToCompleteCheckoutPayload } from './checkout.mappers'
import type { CompleteCheckoutPayloadGql, CreateCheckoutOrderInput } from './checkout.types'
import { startConektaCheckoutForOrder } from '../payments/payments.service'

/**
 * Creates order + Conekta checkout in one step and returns redirect URL.
 * Cart is converted only after Conekta checkout is created successfully.
 */
export async function completeCheckout(
  context: GraphQLContext,
  input: CreateCheckoutOrderInput,
): Promise<CompleteCheckoutPayloadGql> {
  const core = await createCheckoutOrderCore(context, input, { convertCart: false })

  const { token: returnToken } = await createCheckoutReturnToken({
    orderId: core.order.id,
  })

  const baseUrl = getAppBaseUrl()
  const successUrl = `${baseUrl.replace(/\/$/, '')}${checkoutSuccessPath({ token: returnToken })}`

  try {
    const conekta = await startConektaCheckoutForOrder(context, {
      orderId: core.order.id,
      returnToken,
      source: 'completeCheckout',
    })

    if (!conekta.checkoutUrl) {
      throw new GraphQLError('No pudimos preparar el pago. Intenta nuevamente.', {
        extensions: { code: 'CONEKTA_ERROR' },
      })
    }

    const tracking = await finalizeCheckoutOrderSideEffects(context, core)

    return mapOrderToCompleteCheckoutPayload({
      order: core.order,
      payments: [conekta.payment],
      paymentMethod: core.paymentMethod,
      paymentRedirectUrl: conekta.checkoutUrl,
      paymentProviderOrderId: conekta.providerOrderId,
      returnToken,
      successUrl,
      claimUrl: tracking.claimUrl,
      accountOrderUrl: tracking.accountOrderUrl,
    })
  } catch (error) {
    if (error instanceof GraphQLError) {
      throw error
    }
    throw new GraphQLError('No pudimos preparar el pago. Intenta nuevamente.', {
      extensions: { code: 'CONEKTA_ERROR' },
    })
  }
}

/**
 * Retries Conekta checkout for an existing order using return token (no new order).
 */
export async function retryCheckoutPayment(
  context: GraphQLContext,
  returnToken: string,
): Promise<CompleteCheckoutPayloadGql> {
  const trimmed = returnToken.trim()
  if (!trimmed) {
    throw new GraphQLError('Token de retorno inválido.', { extensions: { code: 'BAD_REQUEST' } })
  }

  const validation = await validateCheckoutReturnToken(trimmed)
  if (!validation.valid || !validation.order) {
    throw new GraphQLError('Enlace de pago expirado o inválido.', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  const order = validation.order

  const conekta = await startConektaCheckoutForOrder(context, {
    orderId: order.id,
    returnToken: trimmed,
    source: 'retryCheckoutPayment',
  })

  if (!conekta.checkoutUrl) {
    throw new GraphQLError('No pudimos preparar el pago. Intenta nuevamente.', {
      extensions: { code: 'CONEKTA_ERROR' },
    })
  }

  const payments = await context.prisma.payment.findMany({
    where: { orderId: order.id },
    orderBy: { createdAt: 'desc' },
  })

  const baseUrl = getAppBaseUrl()
  const successUrl = `${baseUrl.replace(/\/$/, '')}${checkoutSuccessPath({ token: trimmed })}`

  const trackingLinks = buildOrderEmailTrackingLinks({
    orderNumber: order.orderNumber,
    userId: order.userId,
  })

  return mapOrderToCompleteCheckoutPayload({
    order,
    payments,
    paymentMethod: payments[0]?.method ?? 'CARD',
    paymentRedirectUrl: conekta.checkoutUrl,
    paymentProviderOrderId: conekta.providerOrderId,
    returnToken: trimmed,
    successUrl,
    claimUrl: trackingLinks.claimUrl ?? null,
    accountOrderUrl: trackingLinks.accountOrderUrl ?? null,
  })
}
