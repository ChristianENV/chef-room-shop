import {
  FulfillmentStatus,
  OrderStatus,
  ShipmentStatus,
} from '@prisma/client'

export type AdminLabelCreationStatuses = {
  shipmentStatus: ShipmentStatus
  orderStatus: OrderStatus
  fulfillmentStatus: FulfillmentStatus
  setShippedAt: boolean
}

/**
 * Derives order/shipment statuses after admin label creation.
 * Mock mode always stays at label-created / ready-to-ship even when tracking exists.
 */
export function deriveAdminLabelCreationStatuses(params: {
  isMockMode: boolean
  hasTracking: boolean
}): AdminLabelCreationStatuses {
  if (params.isMockMode) {
    return {
      shipmentStatus: ShipmentStatus.LABEL_CREATED,
      orderStatus: OrderStatus.READY_TO_SHIP,
      fulfillmentStatus: FulfillmentStatus.PROCESSING,
      setShippedAt: false,
    }
  }

  if (params.hasTracking) {
    return {
      shipmentStatus: ShipmentStatus.IN_TRANSIT,
      orderStatus: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      setShippedAt: true,
    }
  }

  return {
    shipmentStatus: ShipmentStatus.LABEL_CREATED,
    orderStatus: OrderStatus.READY_TO_SHIP,
    fulfillmentStatus: FulfillmentStatus.PROCESSING,
    setShippedAt: false,
  }
}
