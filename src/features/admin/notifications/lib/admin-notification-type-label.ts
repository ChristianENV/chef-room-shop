import type { NotificationType } from '@/src/features/notifications/types'

const TYPE_LABELS: Record<NotificationType, string> = {
  ORDER_CREATED: 'Pedido',
  PAYMENT_CONFIRMED: 'Pago',
  PAYMENT_PENDING: 'Pago pendiente',
  PAYMENT_FAILED: 'Pago fallido',
  ORDER_IN_PRODUCTION: 'Producción',
  ORDER_READY_TO_SHIP: 'Listo para envío',
  ORDER_SHIPPED: 'Enviado',
  ORDER_DELIVERED: 'Entregado',
  DESIGN_SAVED: 'Diseño',
  ACCOUNT_EMAIL_VERIFICATION: 'Cuenta',
  ADMIN_NEW_ORDER: 'Nuevo pedido',
  ADMIN_PAYMENT_RECEIVED: 'Pago recibido',
  ADMIN_SHIPMENT_EXCEPTION: 'Envío',
  ORDER_CLAIM_TRANSFER: 'Reclamo',
  SYSTEM: 'Sistema',
}

export function getAdminNotificationTypeLabel(type: NotificationType): string {
  return TYPE_LABELS[type] ?? type
}
