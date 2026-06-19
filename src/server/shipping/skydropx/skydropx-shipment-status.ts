import 'server-only'

import {
  FulfillmentStatus,
  OrderStatus,
  ShipmentStatus,
} from '@prisma/client'

import { readSkydropxPackageStatus } from './skydropx.mappers'
import type { ShipmentStatusTransition } from './skydropx.webhook.types'

export const SHIPMENT_STATUS_RANK: Record<ShipmentStatus, number> = {
  PENDING: 0,
  LABEL_CREATED: 1,
  IN_TRANSIT: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  FAILED: 5,
  RETURNED: 5,
  CANCELLED: 5,
}

export function shouldApplyShipmentStatus(
  current: ShipmentStatus,
  next: ShipmentStatus,
): boolean {
  if (current === ShipmentStatus.DELIVERED) {
    return next === ShipmentStatus.DELIVERED
  }
  if (current === ShipmentStatus.CANCELLED && next !== ShipmentStatus.CANCELLED) {
    return false
  }
  return SHIPMENT_STATUS_RANK[next] >= SHIPMENT_STATUS_RANK[current]
}

export function mapSkydropxPackageStatusToTransition(input: {
  packageStatus?: string | null
  eventType?: string | null
}): ShipmentStatusTransition | null {
  const statusKey = (input.packageStatus ?? '').toLowerCase()
  const eventType = (input.eventType ?? '').toLowerCase()

  const matches = (...tokens: string[]): boolean =>
    tokens.some(
      (token) => eventType.includes(token) || statusKey === token || statusKey.includes(token),
    )

  if (matches('delivered', 'package.delivered', 'shipment.delivered')) {
    return {
      nextStatus: ShipmentStatus.DELIVERED,
      orderStatus: OrderStatus.DELIVERED,
      fulfillmentStatus: FulfillmentStatus.DELIVERED,
      setDeliveredAt: true,
    }
  }

  if (matches('cancelled', 'canceled', 'shipment.cancelled')) {
    return {
      nextStatus: ShipmentStatus.CANCELLED,
      fulfillmentStatus: FulfillmentStatus.PROCESSING,
    }
  }

  if (
    matches(
      'exception',
      'failed_attempt',
      'failed',
      'shipment.exception',
      'package.failed',
    )
  ) {
    return {
      nextStatus: ShipmentStatus.FAILED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
    }
  }

  if (matches('returned', 'in_return', 'return')) {
    return {
      nextStatus: ShipmentStatus.RETURNED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
    }
  }

  if (matches('out_for_delivery', 'last_mile', 'package.out_for_delivery')) {
    return {
      nextStatus: ShipmentStatus.OUT_FOR_DELIVERY,
      orderStatus: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      setShippedAt: true,
    }
  }

  if (
    matches(
      'in_transit',
      'picked_up',
      'collected',
      'shipment.status.updated',
      'package.tracking.updated',
      'package.in_transit',
      'shipped',
    )
  ) {
    return {
      nextStatus: ShipmentStatus.IN_TRANSIT,
      orderStatus: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      setShippedAt: true,
    }
  }

  if (
    matches(
      'created',
      'label.generated',
      'label_created',
      'shipment.created',
      'shipment.label.generated',
      'ready_to_ship',
    )
  ) {
    return {
      nextStatus: ShipmentStatus.LABEL_CREATED,
      fulfillmentStatus: FulfillmentStatus.PROCESSING,
    }
  }

  if (statusKey) {
    return {
      nextStatus: ShipmentStatus.IN_TRANSIT,
      orderStatus: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      setShippedAt: true,
    }
  }

  return null
}

export function resolveRefreshTrackingTransition(
  previousShipmentStatus: ShipmentStatus,
  skydropxRaw: unknown,
  hasTracking: boolean,
): ShipmentStatusTransition | null {
  const packageStatus = readSkydropxPackageStatus(skydropxRaw)
  if (packageStatus) {
    const transition = mapSkydropxPackageStatusToTransition({
      packageStatus,
      eventType: 'tracking.refresh',
    })

    if (
      transition &&
      shouldApplyShipmentStatus(previousShipmentStatus, transition.nextStatus)
    ) {
      return transition
    }

    return null
  }

  if (hasTracking && previousShipmentStatus === ShipmentStatus.LABEL_CREATED) {
    return {
      nextStatus: ShipmentStatus.IN_TRANSIT,
      orderStatus: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      setShippedAt: true,
    }
  }

  return null
}

export function resolveOrderStatusAfterShipmentTransition(params: {
  previousOrderStatus: OrderStatus
  previousFulfillmentStatus: FulfillmentStatus
  transition: ShipmentStatusTransition
}): {
  orderStatus: OrderStatus
  fulfillmentStatus: FulfillmentStatus
} {
  let orderStatus = params.previousOrderStatus
  let fulfillmentStatus = params.previousFulfillmentStatus
  const { transition } = params

  if (
    transition.orderStatus === OrderStatus.DELIVERED &&
    orderStatus !== OrderStatus.DELIVERED &&
    orderStatus !== OrderStatus.CANCELLED &&
    orderStatus !== OrderStatus.REFUNDED
  ) {
    orderStatus = OrderStatus.DELIVERED
  } else if (
    transition.orderStatus === OrderStatus.SHIPPED &&
    orderStatus !== OrderStatus.DELIVERED &&
    orderStatus !== OrderStatus.SHIPPED &&
    orderStatus !== OrderStatus.CANCELLED &&
    orderStatus !== OrderStatus.REFUNDED
  ) {
    orderStatus = OrderStatus.SHIPPED
  }

  if (transition.fulfillmentStatus) {
    if (
      transition.fulfillmentStatus === FulfillmentStatus.DELIVERED &&
      fulfillmentStatus !== FulfillmentStatus.DELIVERED
    ) {
      fulfillmentStatus = FulfillmentStatus.DELIVERED
    } else if (
      transition.fulfillmentStatus === FulfillmentStatus.SHIPPED &&
      fulfillmentStatus !== FulfillmentStatus.DELIVERED
    ) {
      fulfillmentStatus = FulfillmentStatus.SHIPPED
    } else if (
      transition.fulfillmentStatus === FulfillmentStatus.PROCESSING &&
      fulfillmentStatus === FulfillmentStatus.UNFULFILLED
    ) {
      fulfillmentStatus = FulfillmentStatus.PROCESSING
    }
  }

  return { orderStatus, fulfillmentStatus }
}

export type ShipmentLifecycleNotificationInput = {
  order: {
    id: string
    orderNumber: string
    userId: string | null
  }
  previousOrderStatus: OrderStatus
  newOrderStatus: OrderStatus
  previousShipmentStatus: ShipmentStatus
  newShipmentStatus: ShipmentStatus
  trackingNumber?: string | null
  carrier?: string | null
}

export function buildShipmentLifecycleNotificationInput(params: {
  order: {
    id: string
    orderNumber: string
    userId: string | null
    status: OrderStatus
    fulfillmentStatus: FulfillmentStatus
  }
  previousOrderStatus: OrderStatus
  previousShipmentStatus: ShipmentStatus
  transition: ShipmentStatusTransition
  trackingNumber?: string | null
  carrier?: string | null
}): ShipmentLifecycleNotificationInput {
  const nextStatuses = resolveOrderStatusAfterShipmentTransition({
    previousOrderStatus: params.previousOrderStatus,
    previousFulfillmentStatus: params.order.fulfillmentStatus,
    transition: params.transition,
  })

  return {
    order: {
      id: params.order.id,
      orderNumber: params.order.orderNumber,
      userId: params.order.userId,
    },
    previousOrderStatus: params.previousOrderStatus,
    newOrderStatus: nextStatuses.orderStatus,
    previousShipmentStatus: params.previousShipmentStatus,
    newShipmentStatus: params.transition.nextStatus,
    trackingNumber: params.trackingNumber,
    carrier: params.carrier,
  }
}
