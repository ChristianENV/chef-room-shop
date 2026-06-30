import {
  CartStatus,
  type Design,
  DesignEventType,
  DesignStatus,
  ProductStatus,
  type Prisma,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import { resolveCustomizationPriceFromConfig } from '@/src/server/customizer-pricing/apply-server-pricing'
import {
  buildCommercialOptionsLineKey,
  calculateProductOptionsPriceCents,
  parseCommercialOptionsSnapshot,
  validateSelectedProductOptions,
} from '@/src/server/product-options'

import type { GraphQLContext } from '../../context'
import { collectProductOptionGroupsForValidation } from './cart-product-options'
import { resolveCartOwner } from './cart.auth'
import {
  buildCustomizationSnapshot,
  buildProductSnapshot,
  mapCartToGql,
  toConfigSnapshotJson,
} from './cart.mappers'
import type {
  AddCartItemInput,
  CartGql,
  CartItemWithRelations,
  CartOwner,
  CartWithRelations,
  UpdateCartItemQuantityInput,
} from './cart.types'
import {
  addCartItemInputSchema,
  itemIdSchema,
  updateCartItemQuantityInputSchema,
} from './cart.validation'

const productOptionGroupsInclude = {
  include: {
    values: { orderBy: { sortOrder: 'asc' as const } },
  },
  orderBy: { sortOrder: 'asc' as const },
} as const

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          productType: {
            include: {
              optionGroups: productOptionGroupsInclude,
            },
          },
          images: { orderBy: { sortOrder: 'asc' as const } },
          variants: {
            where: { deletedAt: null },
            include: { color: true, size: true },
          },
          customizationRules: {
            where: { isEnabled: true },
            include: { area: true, option: true },
            orderBy: [{ area: { sortOrder: 'asc' } }, { option: { slug: 'asc' } }],
          },
          optionGroups: productOptionGroupsInclude,
        },
      },
      productVariant: { include: { color: true, size: true } },
      design: true,
    },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.CartInclude

type DesignConfigJson = {
  productId?: string
  productSlug?: string
  finalPriceCents?: number
  elements?: Array<Record<string, unknown>>
  previews?: {
    back?: { url?: string }
  }
  style?: Record<string, unknown>
}

function cartError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code } })
}

function activeCartWhere(owner: CartOwner): Prisma.CartWhereInput {
  if (owner.userId) {
    return { userId: owner.userId, status: CartStatus.ACTIVE, deletedAt: null }
  }
  return {
    guestSessionId: owner.guestSessionId,
    status: CartStatus.ACTIVE,
    deletedAt: null,
  }
}

async function loadCart(context: GraphQLContext, cartId: string): Promise<CartWithRelations> {
  const cart = await context.prisma.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  })

  if (!cart) {
    throw cartError('Carrito no encontrado.', 'NOT_FOUND')
  }

  return cart
}

/**
 * Touches the cart after item changes. Totals are computed at read time (no cent columns on `Cart`).
 */
export async function recalculateCart(
  context: GraphQLContext,
  cartId: string,
): Promise<CartWithRelations> {
  await context.prisma.cart.update({
    where: { id: cartId },
    data: { updatedAt: new Date() },
  })

  return loadCart(context, cartId)
}

async function findActiveCart(
  context: GraphQLContext,
  owner: CartOwner,
): Promise<CartWithRelations | null> {
  return context.prisma.cart.findFirst({
    where: activeCartWhere(owner),
    include: cartInclude,
  })
}

/**
 * Returns or creates the ACTIVE cart for the current user or guest session.
 */
export async function getOrCreateActiveCart(context: GraphQLContext): Promise<CartGql> {
  const owner = await resolveCartOwner(context)
  let cart = await findActiveCart(context, owner)

  if (!cart) {
    cart = await context.prisma.cart.create({
      data: {
        userId: owner.userId,
        guestSessionId: owner.guestSessionId,
        status: CartStatus.ACTIVE,
        currency: 'MXN',
      },
      include: cartInclude,
    })
  }

  return mapCartToGql(cart)
}

async function assertCartItemOwnership(
  context: GraphQLContext,
  itemId: string,
): Promise<{ cart: CartWithRelations; item: CartItemWithRelations }> {
  const owner = await resolveCartOwner(context)
  const parsedItemId = itemIdSchema.parse(itemId)

  const item = await context.prisma.cartItem.findUnique({
    where: { id: parsedItemId },
    include: {
      cart: { include: cartInclude },
      product: {
        include: {
          productType: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: {
            where: { deletedAt: null },
            include: { color: true, size: true },
          },
          customizationRules: {
            where: { isEnabled: true },
            include: { area: true, option: true },
          },
        },
      },
      productVariant: { include: { color: true, size: true } },
      design: true,
    },
  })

  if (!item) {
    throw cartError('Artículo del carrito no encontrado.', 'NOT_FOUND')
  }

  const cart = item.cart as CartWithRelations
  const matchesUser = owner.userId != null && cart.userId === owner.userId
  const matchesGuest = owner.guestSessionId != null && cart.guestSessionId === owner.guestSessionId

  if (!matchesUser && !matchesGuest) {
    throw cartError('No tienes permiso para modificar este artículo.', 'FORBIDDEN')
  }

  if (cart.status !== CartStatus.ACTIVE || cart.deletedAt != null) {
    throw cartError('El carrito no está activo.', 'BAD_REQUEST')
  }

  return { cart, item: item as CartItemWithRelations }
}

function resolveUnitPriceCents(
  product: { basePriceCents: number },
  variant: { priceCents: number | null } | null,
): number {
  if (variant) {
    return variant.priceCents ?? product.basePriceCents
  }
  return product.basePriceCents
}

function resolveCustomizationPriceCents(
  design: { configJson: unknown } | null,
  unitPriceCents: number,
): number {
  if (!design) return 0
  return resolveCustomizationPriceFromConfig(design.configJson, unitPriceCents)
}

async function validateDesignForCart(
  context: GraphQLContext,
  owner: CartOwner,
  designId: string,
  productId: string,
): Promise<Design> {
  const design = await context.prisma.design.findFirst({
    where: {
      id: designId,
      deletedAt: null,
      status: { in: [DesignStatus.DRAFT, DesignStatus.SAVED, DesignStatus.IN_CART] },
    },
  })

  if (!design) {
    throw cartError('Diseño no encontrado.', 'NOT_FOUND')
  }

  if (owner.userId) {
    if (design.userId !== owner.userId) {
      throw cartError('No tienes permiso para usar este diseño.', 'FORBIDDEN')
    }
  } else if (design.guestSessionId !== owner.guestSessionId) {
    throw cartError('No tienes permiso para usar este diseño.', 'FORBIDDEN')
  }

  const config = design.configJson as DesignConfigJson
  if (config.productId && config.productId !== productId) {
    throw cartError('El diseño no corresponde a este producto.', 'BAD_REQUEST')
  }

  if (config.productSlug) {
    const product = await context.prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    })
    if (!product || product.slug !== config.productSlug) {
      throw cartError('El diseño no corresponde a este producto.', 'BAD_REQUEST')
    }
  }

  return design
}

function sameLineKey(
  productId: string,
  productVariantId: string | null | undefined,
  designId: string | null | undefined,
  commercialOptionsKey: string,
): string {
  return `${productId}:${productVariantId ?? ''}:${designId ?? ''}:${commercialOptionsKey}`
}

function commercialOptionsKeyFromItem(item: {
  selectedOptionsJson: unknown
}): string {
  return buildCommercialOptionsLineKey(parseCommercialOptionsSnapshot(item.selectedOptionsJson))
}

/**
 * Adds a product (and optional design) to the active cart.
 */
export async function addCartItem(
  context: GraphQLContext,
  input: AddCartItemInput,
): Promise<CartGql> {
  const parsed = addCartItemInputSchema.parse(input)
  const owner = await resolveCartOwner(context)

  const product = await context.prisma.product.findFirst({
    where: {
      id: parsed.productId,
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    },
    include: {
      productType: {
        include: {
          optionGroups: productOptionGroupsInclude,
        },
      },
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { deletedAt: null },
        include: { color: true, size: true },
      },
      customizationRules: {
        where: { isEnabled: true },
        include: { area: true, option: true },
      },
      optionGroups: productOptionGroupsInclude,
    },
  })

  if (!product) {
    throw cartError('Producto no encontrado.', 'NOT_FOUND')
  }

  let variant: (typeof product.variants)[number] | null = null
  if (parsed.productVariantId) {
    variant = product.variants.find((v) => v.id === parsed.productVariantId) ?? null
    if (!variant) {
      throw cartError('Variante no encontrada para este producto.', 'NOT_FOUND')
    }
    if (variant.stockQty <= 0) {
      throw cartError('La variante seleccionada no tiene stock disponible.', 'BAD_REQUEST')
    }
  }

  const designId = parsed.designId ?? null
  const designRow = designId
    ? await validateDesignForCart(context, owner, designId, product.id)
    : null
  const unitPriceCents = resolveUnitPriceCents(product, variant)
  const customizationPriceCents = resolveCustomizationPriceCents(designRow, unitPriceCents)

  const optionGroups = collectProductOptionGroupsForValidation(product)
  const optionsValidation = validateSelectedProductOptions({
    productId: product.id,
    productTypeId: product.productTypeId,
    optionGroups,
    selectedCommercialOptions: parsed.selectedCommercialOptions ?? [],
  })

  if (!optionsValidation.ok) {
    throw cartError(optionsValidation.error, optionsValidation.code)
  }

  const commercialOptionsSnapshots = optionsValidation.commercialOptionsSnapshots
  const optionPriceCents = calculateProductOptionsPriceCents(commercialOptionsSnapshots)
  const commercialOptionsKey = buildCommercialOptionsLineKey(commercialOptionsSnapshots)

  let cart = await findActiveCart(context, owner)
  if (!cart) {
    cart = await context.prisma.cart.create({
      data: {
        userId: owner.userId,
        guestSessionId: owner.guestSessionId,
        status: CartStatus.ACTIVE,
        currency: 'MXN',
      },
      include: cartInclude,
    })
  }

  const lineKey = sameLineKey(parsed.productId, parsed.productVariantId, designId, commercialOptionsKey)
  const existingItem = cart.items.find(
    (item) =>
      sameLineKey(
        item.productId,
        item.productVariantId,
        item.designId,
        commercialOptionsKeyFromItem(item),
      ) === lineKey,
  )

  if (existingItem) {
    await context.prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + parsed.quantity },
    })
  } else {
    const draftItem = {
      cartId: cart.id,
      productId: product.id,
      productVariantId: variant?.id ?? null,
      designId,
      quantity: parsed.quantity,
      unitPriceCents,
      customizationPriceCents,
      product,
      productVariant: variant,
      design: designRow,
    } as CartItemWithRelations

    const productSnapshot = buildProductSnapshot(draftItem, designRow?.configJson)
    const customizationSnapshot = buildCustomizationSnapshot(designRow, designRow?.configJson, {
      variant,
      customizationPriceCents,
    })
    const configRecord =
      designRow?.configJson &&
      typeof designRow.configJson === 'object' &&
      !Array.isArray(designRow.configJson)
        ? (designRow.configJson as DesignConfigJson)
        : null
    const previewBackUrl =
      customizationSnapshot.previewBackUrl ??
      (configRecord?.previews?.back?.url && typeof configRecord.previews.back.url === 'string'
        ? configRecord.previews.back.url
        : null)
    const elements = customizationSnapshot.elements ?? []
    const selectedOptions = customizationSnapshot.selectedOptions ?? {}

    await context.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        productVariantId: variant?.id ?? null,
        designId,
        quantity: parsed.quantity,
        unitPriceCents,
        customizationPriceCents,
        optionPriceCents,
        selectedOptionsJson:
          commercialOptionsSnapshots.length > 0
            ? (commercialOptionsSnapshots as Prisma.InputJsonValue)
            : undefined,
        configSnapshotJson: toConfigSnapshotJson(
          productSnapshot,
          customizationSnapshot,
          designRow
            ? {
                designSnapshot: {
                  designId: designRow.id,
                  previewUrl: designRow.previewUrl,
                  previewBackUrl,
                  configJson: designRow.configJson,
                  elements,
                  selectedOptions,
                },
                customizationPriceCents,
              }
            : { customizationPriceCents },
        ),
      },
    })
  }

  if (designId) {
    await context.prisma.design.update({
      where: { id: designId },
      data: { status: DesignStatus.IN_CART },
    })
    await context.prisma.designEvent.create({
      data: {
        designId,
        type: DesignEventType.ADDED_TO_CART,
        metadataJson: {
          cartId: cart.id,
          productId: product.id,
          productVariantId: variant?.id ?? null,
          quantity: parsed.quantity,
        },
      },
    })
  }

  const updated = await recalculateCart(context, cart.id)
  return mapCartToGql(updated)
}

/**
 * Updates quantity for a cart line. Quantity `0` removes the line.
 */
export async function updateCartItemQuantity(
  context: GraphQLContext,
  input: UpdateCartItemQuantityInput,
): Promise<CartGql> {
  const parsed = updateCartItemQuantityInputSchema.parse(input)
  const { cart, item } = await assertCartItemOwnership(context, parsed.itemId)

  if (parsed.quantity === 0) {
    await context.prisma.cartItem.delete({ where: { id: item.id } })
  } else {
    await context.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: parsed.quantity },
    })
  }

  const updated = await recalculateCart(context, cart.id)
  return mapCartToGql(updated)
}

/**
 * Removes a line item from the active cart.
 */
export async function removeCartItem(context: GraphQLContext, itemId: string): Promise<CartGql> {
  const parsedId = itemIdSchema.parse(itemId)
  const { cart } = await assertCartItemOwnership(context, parsedId)

  await context.prisma.cartItem.delete({ where: { id: parsedId } })

  const updated = await recalculateCart(context, cart.id)
  return mapCartToGql(updated)
}

/**
 * Removes all items from the active cart.
 */
export async function clearCart(context: GraphQLContext): Promise<CartGql> {
  const owner = await resolveCartOwner(context)
  const cart = await findActiveCart(context, owner)

  if (!cart) {
    return getOrCreateActiveCart(context)
  }

  await context.prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  const updated = await recalculateCart(context, cart.id)
  return mapCartToGql(updated)
}
