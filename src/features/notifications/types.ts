export type NotificationAudience = 'USER' | 'ADMIN'

export type NotificationType =
  | 'ORDER_CREATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED'
  | 'ORDER_IN_PRODUCTION'
  | 'ORDER_READY_TO_SHIP'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'DESIGN_SAVED'
  | 'ACCOUNT_EMAIL_VERIFICATION'
  | 'ADMIN_NEW_ORDER'
  | 'ADMIN_PAYMENT_RECEIVED'
  | 'ADMIN_SHIPMENT_EXCEPTION'
  | 'ORDER_CLAIM_TRANSFER'
  | 'SYSTEM'

export type Notification = {
  id: string
  audience: NotificationAudience
  type: NotificationType
  title: string
  message: string
  href: string | null
  metadataJson: unknown | null
  readAt: string | null
  expiresAt: string | null
  createdAt: string
}

export type NotificationConnection = {
  nodes: Notification[]
  totalCount: number
}

export type MarkAllNotificationsReadPayload = {
  updatedCount: number
}

export type MyNotificationsInput = {
  first?: number
  unreadOnly?: boolean
}
