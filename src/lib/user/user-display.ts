export type UserDisplayInput = {
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  image?: string | null
  avatarUrl?: string | null
}

function trimOrNull(value?: string | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  const single = parts[0] ?? name
  if (single.length >= 2) {
    return single.slice(0, 2).toUpperCase()
  }
  return single[0]?.toUpperCase() ?? 'U'
}

/**
 * Resolves a human-readable label for avatars and menus.
 */
export function getUserDisplayName(user?: UserDisplayInput | null): string {
  if (!user) return 'Usuario'

  const name = trimOrNull(user.name)
  if (name) return name

  const firstName = trimOrNull(user.firstName)
  const lastName = trimOrNull(user.lastName)
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ')
  }

  const email = trimOrNull(user.email)
  if (email) {
    const localPart = email.split('@')[0]
    return localPart || email
  }

  return 'Usuario'
}

/**
 * Up to two uppercase initials for avatar fallback.
 */
export function getUserInitials(user?: UserDisplayInput | null): string {
  if (!user) return 'U'

  const name = trimOrNull(user.name)
  if (name) return initialsFromName(name)

  const firstName = trimOrNull(user.firstName)
  const lastName = trimOrNull(user.lastName)
  if (firstName && lastName) {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  }
  if (firstName || lastName) {
    return initialsFromName(firstName ?? lastName ?? '')
  }

  const email = trimOrNull(user.email)
  if (email) {
    const localPart = email.split('@')[0]
    return localPart?.[0]?.toUpperCase() ?? 'U'
  }

  return 'U'
}
