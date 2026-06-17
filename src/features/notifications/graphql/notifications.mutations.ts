import { NOTIFICATION_FIELDS } from './notifications.fragments'

/**
 * GraphQL mutations for in-app notifications.
 */

export const MARK_NOTIFICATION_READ_MUTATION = /* GraphQL */ `
  ${NOTIFICATION_FIELDS}

  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      ...NotificationFields
    }
  }
`

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = /* GraphQL */ `
  mutation MarkAllNotificationsRead($audience: NotificationAudience) {
    markAllNotificationsRead(audience: $audience) {
      updatedCount
    }
  }
`
