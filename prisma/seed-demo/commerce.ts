import {
  AddressType,
  AuditAction,
  CartStatus,
  DesignAssetType,
  DesignEventType,
  DesignStatus,
  EmailProvider,
  EmailStatus,
  FulfillmentStatus,
  OrderEventType,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PrismaClient,
  ShipmentStatus,
} from '@prisma/client'
import type { Prisma } from '@prisma/client'

import { daysAgo, getOrThrow, padOrderSequence, randomFrom } from '../seed-helpers'
import { DEMO_ORDER_PREFIX, DEMO_PRODUCT_SLUG_PREFIX, PLACEHOLDER_IMAGE_BASE } from './constants'
import type { SeededCatalogResult } from './catalog'

const MX_CITIES = [
  {
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '03100',
    line1: 'Av. Insurgentes Sur 1234',
    line2: 'Col. Del Valle',
  },
  {
    city: 'Guadalajara',
    state: 'Jalisco',
    postalCode: '44100',
    line1: 'Av. López Mateos 890',
    line2: 'Col. Americana',
  },
  {
    city: 'Monterrey',
    state: 'Nuevo León',
    postalCode: '64000',
    line1: 'Av. Constitución 456',
    line2: 'Col. Centro',
  },
  {
    city: 'Puebla',
    state: 'Puebla',
    postalCode: '72000',
    line1: 'Calle 5 de Mayo 210',
    line2: 'Centro Histórico',
  },
  {
    city: 'Querétaro',
    state: 'Querétaro',
    postalCode: '76000',
    line1: 'Blvd. Bernardo Quintana 300',
    line2: 'Juriquilla',
  },
] as const

const CARRIERS = ['DHL', 'FedEx', 'Estafeta'] as const

const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CARD,
  PaymentMethod.OXXO,
  PaymentMethod.SPEI,
]

type OrderSpec = {
  sequence: number
  status: OrderStatus
  fulfillment: FulfillmentStatus
  paymentStatus: PaymentStatus
  withShipment: boolean
  delivered: boolean
}

const ORDER_SPECS: OrderSpec[] = [
  ...Array.from({ length: 5 }, (_, i) => ({
    sequence: i + 1,
    status: OrderStatus.PENDING_PAYMENT,
    fulfillment: FulfillmentStatus.UNFULFILLED,
    paymentStatus: PaymentStatus.PENDING,
    withShipment: false,
    delivered: false,
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    sequence: i + 6,
    status: OrderStatus.PAID,
    fulfillment: FulfillmentStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    withShipment: false,
    delivered: false,
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    sequence: i + 14,
    status: OrderStatus.IN_PRODUCTION,
    fulfillment: FulfillmentStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    withShipment: false,
    delivered: false,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    sequence: i + 19,
    status: OrderStatus.SHIPPED,
    fulfillment: FulfillmentStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    withShipment: true,
    delivered: false,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    sequence: i + 22,
    status: OrderStatus.DELIVERED,
    fulfillment: FulfillmentStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    withShipment: true,
    delivered: true,
  })),
  {
    sequence: 25,
    status: OrderStatus.CANCELLED,
    fulfillment: FulfillmentStatus.CANCELLED,
    paymentStatus: PaymentStatus.CANCELLED,
    withShipment: false,
    delivered: false,
  },
]

const DESIGN_STATUSES: DesignStatus[] = [
  DesignStatus.DRAFT,
  DesignStatus.SAVED,
  DesignStatus.IN_CART,
  DesignStatus.PURCHASED,
]

function designConfig(
  productSlug: string,
  variantSku: string,
  finalPriceCents: number,
): Prisma.InputJsonValue {
  return {
    productSlug,
    productVariantSku: variantSku,
    garment: {
      baseColor: '#FFFFFF',
      trimColor: '#2B3280',
      size: 'M',
    },
    layers: [
      { type: 'text', area: 'chest', value: 'Chef Room' },
      { type: 'logo', area: 'chest', assetRef: 'demo/logos/chef-room.png' },
    ],
    finalPriceCents,
    currency: 'MXN',
    isGuest: false,
  }
}

export type SeededCommerceResult = {
  addresses: number
  designs: number
  designAssets: number
  designEvents: number
  carts: number
  cartItems: number
  orders: number
  orderItems: number
  orderEvents: number
  payments: number
  paymentAttempts: number
  webhooks: number
  shipments: number
  shipmentEvents: number
  emails: number
  auditLogs: number
}

type CommerceInput = {
  prisma: PrismaClient
  customerIds: string[]
  customerEmails: string[]
  superAdminId: string
  catalog: SeededCatalogResult
}

/**
 * Seeds addresses, designs, carts, orders, payments, shipments, emails, and audit logs.
 */
export async function seedDemoCommerce(input: CommerceInput): Promise<SeededCommerceResult> {
  const { prisma, customerIds, customerEmails, superAdminId, catalog } = input
  const counts: SeededCommerceResult = {
    addresses: 0,
    designs: 0,
    designAssets: 0,
    designEvents: 0,
    carts: 0,
    cartItems: 0,
    orders: 0,
    orderItems: 0,
    orderEvents: 0,
    payments: 0,
    paymentAttempts: 0,
    webhooks: 0,
    shipments: 0,
    shipmentEvents: 0,
    emails: 0,
    auditLogs: 0,
  }

  const defaultProductSlug = `${DEMO_PRODUCT_SLUG_PREFIX}filipina-executive-blanca`
  const defaultProductId = getOrThrow(
    catalog.productIdsBySlug.get(defaultProductSlug),
    'default demo product',
  )
  const defaultVariantSku = [...catalog.variantIdsBySku.keys()].find((sku) => sku.includes('FIL'))
  const defaultVariantId = defaultVariantSku
    ? catalog.variantIdsBySku.get(defaultVariantSku)
    : [...catalog.variantIdsBySku.values()][0]

  const defaultProduct = await prisma.product.findUniqueOrThrow({
    where: { id: defaultProductId },
  })

  const addressByUser = new Map<string, { shippingId: string; billingId?: string }>()

  for (let i = 0; i < customerIds.length; i++) {
    const userId = customerIds[i]!
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { firstName: true, lastName: true, phone: true },
    })
    const location = MX_CITIES[i % MX_CITIES.length]!

    const shippingData = {
      fullName: `${user.firstName} ${user.lastName}`,
      line1: location.line1,
      line2: location.line2,
      city: location.city,
      state: location.state,
      postalCode: location.postalCode,
      phone: user.phone,
      isDefault: true,
    }

    const existingShipping = await prisma.address.findFirst({
      where: {
        userId,
        type: AddressType.SHIPPING,
        label: 'Casa',
        deletedAt: null,
      },
    })

    const shipping = existingShipping
      ? await prisma.address.update({
          where: { id: existingShipping.id },
          data: shippingData,
        })
      : await prisma.address.create({
          data: {
            userId,
            type: AddressType.SHIPPING,
            label: 'Casa',
            country: 'MX',
            ...shippingData,
          },
        })
    counts.addresses += 1

    let billingId: string | undefined
    if (i % 3 === 0) {
      const existingBilling = await prisma.address.findFirst({
        where: {
          userId,
          type: AddressType.BILLING,
          label: 'Facturación',
          deletedAt: null,
        },
      })

      const billing = existingBilling
        ? await prisma.address.update({
            where: { id: existingBilling.id },
            data: {
              fullName: shippingData.fullName,
              line1: location.line1,
              city: location.city,
              state: location.state,
              postalCode: location.postalCode,
            },
          })
        : await prisma.address.create({
            data: {
              userId,
              type: AddressType.BILLING,
              label: 'Facturación',
              fullName: shippingData.fullName,
              line1: location.line1,
              city: location.city,
              state: location.state,
              postalCode: location.postalCode,
              country: 'MX',
              phone: user.phone,
            },
          })
      billingId = billing.id
      counts.addresses += 1
    }

    addressByUser.set(userId, { shippingId: shipping.id, billingId })

    if (i < 15) {
      const designCount = (i % 3) + 1
      for (let d = 0; d < designCount; d++) {
        const status = DESIGN_STATUSES[d % DESIGN_STATUSES.length]!
        const designName = `Diseño demo ${d + 1} — ${user.firstName}`
        const config = designConfig(
          defaultProductSlug,
          defaultVariantSku ?? 'DEMO-SKU',
          defaultProduct.basePriceCents + 24900,
        )

        const existingDesign = await prisma.design.findFirst({
          where: { userId, name: designName, deletedAt: null },
        })

        const design = existingDesign
          ? await prisma.design.update({
              where: { id: existingDesign.id },
              data: {
                status,
                configJson: config,
                previewUrl: `${PLACEHOLDER_IMAGE_BASE}&text=Design`,
                previewPublicId: `demo/designs/${userId}/${d}`,
              },
            })
          : await prisma.design.create({
              data: {
                userId,
                status,
                name: designName,
                configJson: config,
                previewUrl: `${PLACEHOLDER_IMAGE_BASE}&text=Design`,
                previewPublicId: `demo/designs/${userId}/${d}`,
              },
            })
        counts.designs += 1

        const assetExists = await prisma.designAsset.findFirst({
          where: { designId: design.id, type: DesignAssetType.LOGO },
        })
        if (!assetExists) {
          await prisma.designAsset.create({
            data: {
              designId: design.id,
              type: DesignAssetType.LOGO,
              url: `${PLACEHOLDER_IMAGE_BASE}&text=Logo`,
              publicId: `demo/logos/${userId}-${d}`,
              sortOrder: 0,
            },
          })
          counts.designAssets += 1
        }

        const eventTypes: DesignEventType[] = [DesignEventType.CREATED]
        if (status !== DesignStatus.DRAFT) {
          eventTypes.push(DesignEventType.UPDATED)
        }
        if (status === DesignStatus.IN_CART || status === DesignStatus.PURCHASED) {
          eventTypes.push(DesignEventType.ADDED_TO_CART)
        }
        if (status === DesignStatus.PURCHASED) {
          eventTypes.push(DesignEventType.PURCHASED)
        }

        for (const eventType of eventTypes) {
          const exists = await prisma.designEvent.findFirst({
            where: { designId: design.id, type: eventType },
          })
          if (!exists) {
            await prisma.designEvent.create({
              data: {
                designId: design.id,
                type: eventType,
                metadataJson: { demo: true },
              },
            })
            counts.designEvents += 1
          }
        }
      }
    }
  }

  const activeCartUsers = customerIds.slice(0, 5)
  const abandonedCartUsers = customerIds.slice(5, 8)
  const convertedCartUsers = customerIds.slice(8, 18)

  async function seedCart(
    userId: string,
    status: CartStatus,
    withDesign: boolean,
  ): Promise<string> {
    const existingCart = await prisma.cart.findFirst({
      where: { userId, status, deletedAt: null },
    })

    const cart = existingCart
      ? await prisma.cart.update({
          where: { id: existingCart.id },
          data: { status },
        })
      : await prisma.cart.create({
          data: {
            userId,
            status,
            currency: 'MXN',
          },
        })
    counts.carts += 1

    const itemExists = await prisma.cartItem.findFirst({ where: { cartId: cart.id } })
    if (!itemExists) {
      const design = withDesign
        ? await prisma.design.findFirst({
            where: { userId, status: { in: [DesignStatus.IN_CART, DesignStatus.SAVED] } },
          })
        : null

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: defaultProductId,
          productVariantId: defaultVariantId ?? null,
          designId: design?.id ?? null,
          quantity: randomFrom([1, 2, 3]),
          unitPriceCents: defaultProduct.basePriceCents,
          customizationPriceCents: design ? 24900 : 0,
          configSnapshotJson: design
            ? { designId: design.id, customization: 'logo-chest' }
            : { plain: true },
        },
      })
      counts.cartItems += 1
    }

    return cart.id
  }

  for (const userId of activeCartUsers) {
    await seedCart(userId, CartStatus.ACTIVE, true)
  }
  for (const userId of abandonedCartUsers) {
    await seedCart(userId, CartStatus.ABANDONED, false)
  }

  let orderIndex = 0
  for (const spec of ORDER_SPECS) {
    const userId = customerIds[orderIndex % customerIds.length]!
    const email = customerEmails[orderIndex % customerEmails.length]!
    const addresses = getOrThrow(addressByUser.get(userId), 'address')
    const orderNumber = `${DEMO_ORDER_PREFIX}${padOrderSequence(spec.sequence)}`
    const placedAt =
      spec.status === OrderStatus.PENDING_PAYMENT ? null : daysAgo(30 - spec.sequence)

    const subtotalCents = defaultProduct.basePriceCents * 2
    const customizationTotalCents = 24900
    const shippingCents = 19900
    const discountCents = spec.sequence % 4 === 0 ? 10000 : 0
    const taxCents = Math.round((subtotalCents + customizationTotalCents) * 0.16)
    const totalCents =
      subtotalCents + customizationTotalCents + shippingCents + taxCents - discountCents

    const order = await prisma.order.upsert({
      where: { orderNumber },
      update: {
        status: spec.status,
        fulfillmentStatus: spec.fulfillment,
        customerEmail: email,
        subtotalCents,
        customizationTotalCents,
        shippingCents,
        discountCents,
        taxCents,
        totalCents,
        placedAt,
      },
      create: {
        orderNumber,
        userId,
        status: spec.status,
        fulfillmentStatus: spec.fulfillment,
        customerEmail: email,
        customerPhone: '+525555000000',
        subtotalCents,
        customizationTotalCents,
        shippingCents,
        discountCents,
        taxCents,
        totalCents,
        currency: 'MXN',
        shippingAddressId: addresses.shippingId,
        billingAddressId: addresses.billingId ?? addresses.shippingId,
        placedAt,
        createdAt: daysAgo(35 - spec.sequence),
      },
    })
    counts.orders += 1

    const itemExists = await prisma.orderItem.findFirst({ where: { orderId: order.id } })
    if (!itemExists) {
      const design =
        (await prisma.design.findFirst({
          where: { userId, status: DesignStatus.PURCHASED },
        })) ??
        (await prisma.design.findFirst({
          where: { userId },
        }))
      const lineTotal = defaultProduct.basePriceCents + (design ? 24900 : 0)

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          designId: design?.id ?? null,
          quantity: 2,
          unitPriceCents: defaultProduct.basePriceCents,
          customizationPriceCents: design ? 24900 : 0,
          lineTotalCents: lineTotal * 2,
          productSnapshotJson: {
            slug: defaultProductSlug,
            name: defaultProduct.name,
            basePriceCents: defaultProduct.basePriceCents,
          },
          designSnapshotJson: design
            ? { designId: design.id, previewPublicId: design.previewPublicId }
            : undefined,
        },
      })
      counts.orderItems += 1
    }

    const orderEvents: { type: OrderEventType; message: string }[] = [
      { type: OrderEventType.CREATED, message: 'Pedido demo creado' },
    ]
    if (spec.paymentStatus === PaymentStatus.PAID) {
      orderEvents.push({
        type: OrderEventType.PAYMENT_UPDATED,
        message: 'Pago confirmado (demo)',
      })
    }
    if (spec.status === OrderStatus.IN_PRODUCTION) {
      orderEvents.push({
        type: OrderEventType.FULFILLMENT_UPDATED,
        message: 'En producción',
      })
    }
    if (spec.withShipment) {
      orderEvents.push({
        type: OrderEventType.NOTE_ADDED,
        message: 'Guía de rastreo demo agregada',
      })
    }
    if (spec.delivered) {
      orderEvents.push({
        type: OrderEventType.STATUS_CHANGED,
        message: 'Pedido entregado',
      })
    }
    if (spec.status === OrderStatus.CANCELLED) {
      orderEvents.push({
        type: OrderEventType.CANCELLED,
        message: 'Pedido cancelado (demo)',
      })
    }

    for (const evt of orderEvents) {
      const exists = await prisma.orderEvent.findFirst({
        where: { orderId: order.id, type: evt.type, message: evt.message },
      })
      if (!exists) {
        await prisma.orderEvent.create({
          data: {
            orderId: order.id,
            type: evt.type,
            message: evt.message,
            metadataJson: { demo: true },
          },
        })
        counts.orderEvents += 1
      }
    }

    const providerOrderId = `conekta_ord_demo_${orderNumber}`
    const method = PAYMENT_METHODS[spec.sequence % PAYMENT_METHODS.length]!

    const payment = await prisma.payment.upsert({
      where: {
        provider_providerOrderId: {
          provider: PaymentProvider.CONEKTA,
          providerOrderId,
        },
      },
      update: {
        status: spec.paymentStatus,
        amountCents: totalCents,
        method,
        paidAt: spec.paymentStatus === PaymentStatus.PAID ? daysAgo(28 - spec.sequence) : null,
      },
      create: {
        orderId: order.id,
        provider: PaymentProvider.CONEKTA,
        providerOrderId,
        status: spec.paymentStatus,
        amountCents: totalCents,
        currency: 'MXN',
        method,
        paidAt: spec.paymentStatus === PaymentStatus.PAID ? daysAgo(28 - spec.sequence) : null,
      },
    })
    counts.payments += 1

    const attemptExists = await prisma.paymentAttempt.findFirst({
      where: { paymentId: payment.id },
    })
    if (!attemptExists) {
      await prisma.paymentAttempt.create({
        data: {
          paymentId: payment.id,
          providerChargeId: `conekta_charge_demo_${orderNumber}`,
          status: spec.paymentStatus,
          amountCents: totalCents,
          rawResponseJson: {
            demo: true,
            provider: 'conekta',
            method,
            status: spec.paymentStatus.toLowerCase(),
          },
        },
      })
      counts.paymentAttempts += 1
    }

    const webhookEventId = `demo-conekta-${orderNumber}-paid`
    await prisma.conektaWebhookEvent.upsert({
      where: { eventId: webhookEventId },
      update: {
        processedAt: spec.paymentStatus === PaymentStatus.PAID ? daysAgo(27 - spec.sequence) : null,
      },
      create: {
        eventId: webhookEventId,
        eventType: spec.paymentStatus === PaymentStatus.CANCELLED ? 'charge.failed' : 'order.paid',
        rawPayloadJson: {
          demo: true,
          orderNumber,
          status: spec.paymentStatus,
        },
        processedAt: spec.paymentStatus === PaymentStatus.PAID ? daysAgo(27 - spec.sequence) : null,
      },
    })
    counts.webhooks += 1

    if (spec.withShipment) {
      const shipmentData = {
        status: spec.delivered ? ShipmentStatus.DELIVERED : ShipmentStatus.IN_TRANSIT,
        carrier: randomFrom(CARRIERS),
        trackingNumber: `DEMO${padOrderSequence(spec.sequence, 10)}`,
        shippedAt: daysAgo(10 - (spec.sequence % 5)),
        deliveredAt: spec.delivered ? daysAgo(3) : null,
      }

      const existingShipment = await prisma.shipment.findFirst({
        where: { orderId: order.id },
      })

      const shipment = existingShipment
        ? await prisma.shipment.update({
            where: { id: existingShipment.id },
            data: shipmentData,
          })
        : await prisma.shipment.create({
            data: {
              orderId: order.id,
              ...shipmentData,
            },
          })
      counts.shipments += 1

      for (const shipStatus of [
        ShipmentStatus.PENDING,
        ShipmentStatus.IN_TRANSIT,
        ...(spec.delivered ? [ShipmentStatus.DELIVERED] : []),
      ]) {
        const exists = await prisma.shipmentEvent.findFirst({
          where: { shipmentId: shipment.id, status: shipStatus },
        })
        if (!exists) {
          await prisma.shipmentEvent.create({
            data: {
              shipmentId: shipment.id,
              status: shipStatus,
              message: `Demo ${shipStatus}`,
              metadataJson: { demo: true },
            },
          })
          counts.shipmentEvents += 1
        }
      }
    }

    const emailTemplates: { key: string; subject: string; status: EmailStatus }[] = [
      { key: 'order_confirmation', subject: 'Confirmación de pedido', status: EmailStatus.SENT },
      {
        key: 'payment_confirmation',
        subject: 'Pago recibido',
        status: spec.paymentStatus === PaymentStatus.PAID ? EmailStatus.SENT : EmailStatus.QUEUED,
      },
    ]
    if (spec.withShipment) {
      emailTemplates.push({
        key: 'shipping_update',
        subject: 'Tu pedido va en camino',
        status: EmailStatus.SENT,
      })
    }
    if (spec.delivered) {
      emailTemplates.push({
        key: 'delivered',
        subject: 'Pedido entregado',
        status: EmailStatus.SENT,
      })
    }
    if (spec.sequence === 3) {
      emailTemplates.push({
        key: 'payment_failed',
        subject: 'Problema con tu pago',
        status: EmailStatus.FAILED,
      })
    }

    for (const tmpl of emailTemplates) {
      const existing = await prisma.emailMessage.findFirst({
        where: { orderId: order.id, templateKey: tmpl.key },
      })
      if (existing) {
        await prisma.emailMessage.update({
          where: { id: existing.id },
          data: { status: tmpl.status },
        })
      } else {
        await prisma.emailMessage.create({
          data: {
            orderId: order.id,
            toEmail: email,
            subject: tmpl.subject,
            status: tmpl.status,
            provider: EmailProvider.OTHER,
            templateKey: tmpl.key,
            metadataJson: { demo: true },
            sentAt: tmpl.status === EmailStatus.SENT ? daysAgo(5) : null,
          },
        })
      }
      counts.emails += 1
    }

    if (orderIndex < convertedCartUsers.length) {
      const userId = convertedCartUsers[orderIndex]!
      const existingConverted = await prisma.cart.findFirst({
        where: { userId, status: CartStatus.CONVERTED, deletedAt: null },
      })
      if (!existingConverted) {
        await prisma.cart.create({
          data: {
            userId,
            status: CartStatus.CONVERTED,
            currency: 'MXN',
          },
        })
        counts.carts += 1
      }
    }

    orderIndex += 1
  }

  const auditSpecs: {
    action: AuditAction
    entityType: string
    metadataJson: Prisma.InputJsonValue
  }[] = [
    {
      action: AuditAction.CREATE,
      entityType: 'Product',
      metadataJson: { demo: true, note: 'Demo catalog product batch' },
    },
    {
      action: AuditAction.UPDATE,
      entityType: 'Order',
      metadataJson: { demo: true, note: 'Demo order status sync' },
    },
    {
      action: AuditAction.PAYMENT_RECEIVED,
      entityType: 'Payment',
      metadataJson: { demo: true, provider: 'conekta' },
    },
    {
      action: AuditAction.UPDATE,
      entityType: 'User',
      metadataJson: { demo: true, note: 'Demo user profile touch' },
    },
  ]

  for (const spec of auditSpecs) {
    const exists = await prisma.auditLog.findFirst({
      where: {
        userId: superAdminId,
        action: spec.action,
        entityType: spec.entityType,
      },
    })
    if (!exists) {
      await prisma.auditLog.create({
        data: {
          userId: superAdminId,
          action: spec.action,
          entityType: spec.entityType,
          metadataJson: spec.metadataJson,
        },
      })
      counts.auditLogs += 1
    }
  }

  return counts
}
