'use client'

import { AdminOrdersError } from '@/src/features/admin/orders/components/admin-orders-error'

type AdminShippingErrorProps = {
  message?: string
  onRetry?: () => void
}

/**
 * Error state for shipment query (does not block the rest of the drawer).
 */
export function AdminShippingError({
  message = 'No pudimos cargar la guía de envío.',
  onRetry,
}: AdminShippingErrorProps) {
  return <AdminOrdersError message={message} onRetry={onRetry} compact />
}
