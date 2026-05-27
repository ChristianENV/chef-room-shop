import { ShippingProvider, type Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { APP_LIMITS } from '@/src/config/vars'
import { getShippingOriginConfig } from '@/src/server/shipping/shipping.config'
import { getPackageForCartItems } from '@/src/server/shipping/shipping.package'
import {
  createSkydropxQuotation,
  getSkydropxQuotation,
} from '@/src/server/shipping/skydropx/skydropx.client'
import { isSkydropxConfigured } from '@/src/server/shipping/skydropx/skydropx.config'
import { SkydropxApiError, SkydropxConfigError } from '@/src/server/shipping/skydropx/skydropx.errors'
import { skydropxErrorToGraphQLError } from '@/src/server/shipping/skydropx/skydropx-graphql-errors'
import type { DestinationAddressInput } from '@/src/server/shipping/skydropx/skydropx.mappers'
import {
  mapShippingQuoteToSkydropxQuotationPayload,
  parseSkydropxQuotationResponse,
  skydropxRateExpiresAt,
  type MappedShippingRate,
} from '@/src/server/shipping/skydropx/skydropx.mappers'
import {
  SkydropxValidationError,
  validateQuotationDestination,
  validateQuotationParcel,
  validateShippingOriginForQuotation,
} from '@/src/server/shipping/skydropx/skydropx.validation'

import type { GraphQLContext } from '../../context'
import {
  resolveShippingQuoteOwner,
  resolveShippingQuoteOwnerWithCart,
} from './shipping.auth'
import { mapShippingQuoteToGql, toShippingQuotePayload } from './shipping.mappers'
import type {
  CreateShippingQuoteInput,
  ShippingQuoteOwner,
  ShippingQuotePayloadGql,
  ShippingQuoteWithRates,
} from './shipping.types'
import {
  createShippingQuoteInputSchema,
  shippingQuoteIdSchema,
  shippingRateIdSchema,
} from './shipping.validation'

const QUOTE_REUSE_WINDOW_MS = APP_LIMITS.shipping.quoteReuseMinutes * 60 * 1000

const quoteInclude = {
  rates: { orderBy: { amountCents: 'asc' as const } },
} satisfies Prisma.ShippingQuoteInclude

function shippingError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code } })
}

function wrapSkydropxError(error: unknown): GraphQLError {
  if (error instanceof SkydropxConfigError) {
    return shippingError(error.message, 'SERVICE_UNAVAILABLE')
  }
  if (error instanceof SkydropxValidationError) {
    return shippingError(error.message, 'SKYDROPX_VALIDATION_ERROR')
  }
  if (error instanceof SkydropxApiError) {
    return skydropxErrorToGraphQLError(error, 'quote')
  }
  if (error instanceof GraphQLError) {
    return error
  }
  throw error
}

function requireSkydropxConfigured(): void {
  if (!isSkydropxConfigured()) {
    throw new SkydropxConfigError()
  }
}

function quoteBelongsToOwner(
  quote: { userId: string | null; guestSessionId: string | null },
  owner: ShippingQuoteOwner,
): boolean {
  if (owner.userId) {
    return quote.userId === owner.userId
  }
  return quote.guestSessionId === owner.guestSessionId
}

function destinationFromInput(
  destination: CreateShippingQuoteInput['destination'],
): DestinationAddressInput {
  const city = destination.city?.trim() || 'Ciudad'
  const state = destination.state?.trim() || 'México'
  return {
    postalCode: destination.postalCode.trim(),
    city,
    state,
    neighborhood: city,
    country: destination.country?.trim().toUpperCase() || 'MX',
  }
}

async function loadQuoteWithRates(
  context: GraphQLContext,
  id: string,
): Promise<ShippingQuoteWithRates | null> {
  return context.prisma.shippingQuote.findUnique({
    where: { id },
    include: quoteInclude,
  })
}

async function assertQuoteOwnership(
  context: GraphQLContext,
  quoteId: string,
): Promise<ShippingQuoteWithRates> {
  const owner = await resolveShippingQuoteOwner(context)
  const quote = await loadQuoteWithRates(context, quoteId)

  if (!quote) {
    throw shippingError('Cotización no encontrada.', 'NOT_FOUND')
  }

  if (!quoteBelongsToOwner(quote, owner)) {
    throw shippingError('No tienes acceso a esta cotización.', 'FORBIDDEN')
  }

  return quote
}

function hasValidRates(rates: Array<{ expiresAt: Date | null }>): boolean {
  const now = new Date()
  return rates.some((rate) => !rate.expiresAt || rate.expiresAt > now)
}

async function findReusableQuote(
  context: GraphQLContext,
  cartId: string,
  destinationPostalCode: string,
): Promise<ShippingQuoteWithRates | null> {
  const since = new Date(Date.now() - QUOTE_REUSE_WINDOW_MS)

  const quote = await context.prisma.shippingQuote.findFirst({
    where: {
      cartId,
      destinationPostalCode,
      createdAt: { gte: since },
    },
    include: quoteInclude,
    orderBy: { createdAt: 'desc' },
  })

  if (!quote || quote.rates.length === 0 || !hasValidRates(quote.rates)) {
    return null
  }

  return quote
}

async function persistRatesForQuote(
  context: GraphQLContext,
  quoteId: string,
  mappedRates: MappedShippingRate[],
  rateExpiresAt: Date,
): Promise<ShippingQuoteWithRates> {
  await context.prisma.shippingRate.deleteMany({ where: { quoteId } })

  if (mappedRates.length > 0) {
    await context.prisma.shippingRate.createMany({
      data: mappedRates.map((rate) => ({
        quoteId,
        providerRateId: rate.providerRateId,
        carrier: rate.carrier,
        service: rate.service,
        amountCents: rate.amountCents,
        currency: rate.currency,
        estimatedDays: rate.estimatedDays,
        estimatedDeliveryDate: rate.estimatedDeliveryDate,
        expiresAt: rateExpiresAt,
        rawJson: rate.rawJson as Prisma.InputJsonValue,
      })),
    })
  }

  const updated = await loadQuoteWithRates(context, quoteId)
  if (!updated) {
    throw shippingError('Cotización no encontrada.', 'NOT_FOUND')
  }
  return updated
}

async function applySkydropxQuotationToQuote(
  context: GraphQLContext,
  quoteId: string,
  rawResponse: unknown,
): Promise<ShippingQuoteWithRates> {
  const parsed = parseSkydropxQuotationResponse(rawResponse)
  const expiresAt = skydropxRateExpiresAt()

  await context.prisma.shippingQuote.update({
    where: { id: quoteId },
    data: {
      providerQuoteId: parsed.providerQuoteId,
      isCompleted: parsed.isCompleted,
      expiresAt,
      rawResponseJson: rawResponse as Prisma.InputJsonValue,
    },
  })

  return persistRatesForQuote(context, quoteId, parsed.rates, expiresAt)
}

/**
 * Creates a Skydropx quotation for the active cart and destination postal code.
 */
export async function createShippingQuote(
  context: GraphQLContext,
  input: CreateShippingQuoteInput,
): Promise<ShippingQuotePayloadGql> {
  try {
    requireSkydropxConfigured()
    const parsed = createShippingQuoteInputSchema.parse(input)
    const { owner, cart } = await resolveShippingQuoteOwnerWithCart(context)
    const origin = getShippingOriginConfig()
    const destinationInput = destinationFromInput(parsed.destination)
    const destination = validateQuotationDestination(destinationInput)
    const packageDimensions = getPackageForCartItems(cart.items)

    validateShippingOriginForQuotation()
    validateQuotationParcel(packageDimensions)

    const reusable = await findReusableQuote(
      context,
      cart.id,
      destination.postalCode,
    )
    if (reusable) {
      return toShippingQuotePayload(reusable)
    }

    const skydropxPayload = mapShippingQuoteToSkydropxQuotationPayload({
      destination: {
        postalCode: destination.postalCode,
        city: destination.city,
        state: destination.state,
        neighborhood: destination.neighborhood,
        country: destination.country,
      },
      cartItems: cart.items,
    })

    const quote = await context.prisma.shippingQuote.create({
      data: {
        userId: owner.userId,
        guestSessionId: owner.guestSessionId,
        cartId: cart.id,
        provider: ShippingProvider.SKYDROPX,
        originPostalCode: origin.postalCode,
        destinationPostalCode: destination.postalCode,
        packageJson: packageDimensions as Prisma.InputJsonValue,
        rawRequestJson: skydropxPayload as Prisma.InputJsonValue,
        isCompleted: false,
      },
      include: quoteInclude,
    })

    const rawResponse = await createSkydropxQuotation(skydropxPayload, {
      destinationPostalCode: destination.postalCode,
      destinationCity: destination.city,
      destinationState: destination.state,
      originPostalCode: origin.postalCode,
    })
    const updated = await applySkydropxQuotationToQuote(context, quote.id, rawResponse)
    return toShippingQuotePayload(updated)
  } catch (error) {
    throw wrapSkydropxError(error)
  }
}

/**
 * Returns a shipping quote by id for the current owner (no Skydropx call).
 */
export async function getShippingQuoteById(
  context: GraphQLContext,
  id: string,
): Promise<ShippingQuotePayloadGql | null> {
  const quoteId = shippingQuoteIdSchema.parse(id)
  const quote = await assertQuoteOwnership(context, quoteId)
  return toShippingQuotePayload(quote)
}

/**
 * Polls Skydropx for updated rates when isCompleted is false.
 */
export async function refreshShippingQuote(
  context: GraphQLContext,
  id: string,
): Promise<ShippingQuotePayloadGql> {
  try {
    requireSkydropxConfigured()
    const quoteId = shippingQuoteIdSchema.parse(id)
    const quote = await assertQuoteOwnership(context, quoteId)

    if (!quote.providerQuoteId) {
      throw shippingError(
        'La cotización aún no tiene referencia en Skydropx.',
        'BAD_REQUEST',
      )
    }

    const rawResponse = await getSkydropxQuotation(quote.providerQuoteId)
    const updated = await applySkydropxQuotationToQuote(context, quote.id, rawResponse)
    return toShippingQuotePayload(updated)
  } catch (error) {
    throw wrapSkydropxError(error)
  }
}

/**
 * Marks one rate as selected for checkout (future PR).
 */
export async function selectShippingRate(
  context: GraphQLContext,
  rateId: string,
): Promise<ShippingQuotePayloadGql> {
  const parsedRateId = shippingRateIdSchema.parse(rateId)
  const owner = await resolveShippingQuoteOwner(context)

  const rate = await context.prisma.shippingRate.findUnique({
    where: { id: parsedRateId },
    include: { quote: { include: quoteInclude } },
  })

  if (!rate) {
    throw shippingError('Tarifa no encontrada.', 'NOT_FOUND')
  }

  if (!quoteBelongsToOwner(rate.quote, owner)) {
    throw shippingError('No tienes acceso a esta tarifa.', 'FORBIDDEN')
  }

  if (rate.expiresAt && rate.expiresAt <= new Date()) {
    throw shippingError('La tarifa de envío expiró. Cotiza de nuevo.', 'BAD_REQUEST')
  }

  const now = new Date()

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

  const updated = await loadQuoteWithRates(context, rate.quoteId)
  if (!updated) {
    throw shippingError('Cotización no encontrada.', 'NOT_FOUND')
  }

  return toShippingQuotePayload(updated)
}

/** Used by resolver when only the quote object is needed. */
export async function getShippingQuoteGqlById(
  context: GraphQLContext,
  id: string,
): Promise<ReturnType<typeof mapShippingQuoteToGql> | null> {
  const payload = await getShippingQuoteById(context, id)
  return payload?.quote ?? null
}
