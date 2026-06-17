/**
 * Shared GraphQL selection set for in-app notifications.
 */

export const NOTIFICATION_FIELDS = /* GraphQL */ `
  fragment NotificationFields on Notification {
    id
    audience
    type
    title
    message
    href
    metadataJson
    readAt
    expiresAt
    createdAt
  }
`
