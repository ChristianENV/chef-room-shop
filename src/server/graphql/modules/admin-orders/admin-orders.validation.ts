import {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
} from '@prisma/client'
import { z } from 'zod'

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]]
const paymentStatusValues = Object.values(PaymentStatus) as [string, ...string[]]
const fulfillmentStatusValues = Object.values(FulfillmentStatus) as [string, ...string[]]
const shipmentStatusValues = Object.values(ShipmentStatus) as [string, ...string[]]

const sortFields = ['createdAt', 'totalCents', 'status', 'paymentStatus', 'orderNumber'] as const

export const adminOrdersListInputSchema = z.object({
  filter: z
    .object({
      search: z.string().trim().max(120).optional().nullable(),
      status: z.enum(orderStatusValues).optional().nullable(),
      paymentStatus: z.enum(paymentStatusValues).optional().nullable(),
      fulfillmentStatus: z.enum(fulfillmentStatusValues).optional().nullable(),
      productionOnly: z.boolean().optional().nullable(),
      hasCustomDesign: z.boolean().optional().nullable(),
      dateFrom: z.string().trim().max(40).optional().nullable(),
      dateTo: z.string().trim().max(40).optional().nullable(),
    })
    .optional()
    .nullable(),
  sort: z
    .object({
      field: z.enum(sortFields).optional().nullable(),
      direction: z.enum(['asc', 'desc']).optional().nullable(),
    })
    .optional()
    .nullable(),
  limit: z.number().int().min(1).max(100).optional().nullable(),
  offset: z.number().int().min(0).optional().nullable(),
})

export const adminOrdersLimitSchema = z.number().int().min(1).max(100).optional().nullable()

export const orderNumberSchema = z.string().trim().min(1).max(64)

export const updateAdminOrderStatusInputSchema = z.object({
  orderNumber: orderNumberSchema,
  status: z.enum(orderStatusValues),
  message: z.string().trim().max(1000).optional().nullable(),
})

export const addAdminOrderTrackingInputSchema = z.object({
  orderNumber: orderNumberSchema,
  carrier: z.string().trim().min(1).max(120),
  trackingNumber: z.string().trim().min(1).max(120),
  status: z.enum(shipmentStatusValues).optional().nullable(),
  shippedAt: z.string().trim().max(40).optional().nullable(),
})

export const addAdminOrderNoteInputSchema = z.object({
  orderNumber: orderNumberSchema,
  note: z.string().trim().min(1).max(1000),
})

export const cancelAdminOrderSchema = z.object({
  orderNumber: orderNumberSchema,
  reason: z.string().trim().max(1000).optional().nullable(),
})

/**
 * Parses list query input with defaults (limit 20, offset 0).
 */
export function parseAdminOrdersListInput(input: unknown) {
  const parsed = adminOrdersListInputSchema.parse(input ?? {})
  return {
    filter: parsed.filter ?? undefined,
    sort: parsed.sort ?? undefined,
    limit: parsed.limit ?? 20,
    offset: parsed.offset ?? 0,
  }
}

/**
 * Parses production queue limit (default 20).
 */
export function parseAdminProductionQueueLimit(limit: unknown): number {
  return adminOrdersLimitSchema.parse(limit) ?? 20
}
