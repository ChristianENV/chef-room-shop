'use client'

import { EditableAvatar } from '@/src/features/uploads/components/editable-avatar'
import { CustomerTierBadge } from '@/src/features/storefront/account/components/customer-tier-badge'
import type { UserDisplayInput } from '@/src/lib/user/user-display'

export type AccountProfileHeaderProps = {
  user: (UserDisplayInput & { customerTier?: string | null }) | null
}

/**
 * Profile page header: editable avatar + name + email.
 *
 * The avatar opens the upload dialog on click. After a successful upload the
 * profile query is automatically invalidated (via the upload mutation hook),
 * so the avatar refreshes without a page reload.
 */
export function AccountProfileHeader({ user }: AccountProfileHeaderProps) {
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.name?.trim() ||
    'Mi perfil'

  return (
    <div className="flex flex-col items-center gap-3 pb-2 sm:flex-row sm:items-center sm:gap-5">
      <EditableAvatar user={user} />
      <div className="text-center sm:text-left">
        <h2 className="font-sans text-xl font-semibold text-foreground">{displayName}</h2>
        {user?.email && (
          <p className="font-serif text-sm text-muted-foreground">{user.email}</p>
        )}
        <div className="mt-2 flex justify-center sm:justify-start">
          <CustomerTierBadge customerTier={user?.customerTier} showRegular />
        </div>
      </div>
    </div>
  )
}
