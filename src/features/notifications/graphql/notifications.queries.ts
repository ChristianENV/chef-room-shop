import { NOTIFICATION_FIELDS } from './notifications.fragments'

/**
 * GraphQL documents for in-app notifications (requires session cookie).
 */

export const MY_NOTIFICATIONS_QUERY = /* GraphQL */ `
  ${NOTIFICATION_FIELDS}

  query MyNotifications($input: MyNotificationsInput) {
    myNotifications(input: $input) {
      nodes {
        ...NotificationFields
      }
      totalCount
    }
  }
`

export const MY_UNREAD_NOTIFICATION_COUNT_QUERY = /* GraphQL */ `
  query MyUnreadNotificationCount {
    myUnreadNotificationCount
  }
`
