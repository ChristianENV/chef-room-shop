'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  getUserDisplayName,
  getUserInitials,
  type UserDisplayInput,
} from '@/src/lib/user/user-display'

const sizeClasses = {
  sm: 'size-9 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-20 text-base',
} as const

export type UserAvatarProps = {
  user?: UserDisplayInput | null
  size?: keyof typeof sizeClasses
  className?: string
  /** When true, defers accessible name to parent (e.g. menu trigger button). */
  decorative?: boolean
}

/**
 * Profile avatar with OAuth image or initials fallback (Chef Room premium styling).
 */
export function UserAvatar({
  user,
  size = 'md',
  className,
  decorative = false,
}: UserAvatarProps) {
  const displayName = getUserDisplayName(user)
  const initials = getUserInitials(user)
  const imageSrc = user?.image ?? user?.avatarUrl ?? undefined

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        'border border-border/60 bg-primary/10 transition-[box-shadow,opacity]',
        className,
      )}
      aria-hidden={decorative}
      aria-label={decorative ? undefined : displayName}
    >
      {imageSrc ? (
        <AvatarImage
          key={imageSrc}
          src={imageSrc}
          alt={displayName}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback
        delayMs={imageSrc ? 600 : 0}
        className="bg-primary/10 font-sans font-semibold text-primary"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
