const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const relativeTimeFormatter = new Intl.RelativeTimeFormat('es-MX', {
  numeric: 'auto',
})

/**
 * Formats notification timestamps for navbar panel and account page.
 */
export function formatNotificationCreatedAt(iso: string, now = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = date.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / 60_000)

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 7) {
    return relativeTimeFormatter.format(diffDays, 'day')
  }

  return dateTimeFormatter.format(date)
}
