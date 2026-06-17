export const notificationsTypeDefs = /* GraphQL */ `
  enum NotificationAudience {
    USER
    ADMIN
  }

  enum NotificationType {
    ORDER_CREATED
    PAYMENT_CONFIRMED
    PAYMENT_PENDING
    PAYMENT_FAILED
    ORDER_IN_PRODUCTION
    ORDER_READY_TO_SHIP
    ORDER_SHIPPED
    ORDER_DELIVERED
    DESIGN_SAVED
    ACCOUNT_EMAIL_VERIFICATION
    ADMIN_NEW_ORDER
    ADMIN_PAYMENT_RECEIVED
    ADMIN_SHIPMENT_EXCEPTION
    ORDER_CLAIM_TRANSFER
    SYSTEM
  }

  type Notification {
    id: ID!
    audience: NotificationAudience!
    type: NotificationType!
    title: String!
    message: String!
    href: String
    metadataJson: JSON
    readAt: String
    expiresAt: String
    createdAt: String!
  }

  type NotificationConnection {
    nodes: [Notification!]!
    totalCount: Int!
  }

  input MyNotificationsInput {
    first: Int = 20
    unreadOnly: Boolean = false
  }

  type MarkAllNotificationsReadPayload {
    updatedCount: Int!
  }
`
