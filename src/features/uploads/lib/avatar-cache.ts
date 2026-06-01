import type { QueryClient } from '@tanstack/react-query'

import { accountQueryKeys } from '@/src/features/storefront/account/api/account.query-keys'
import type { AccountUser } from '@/src/features/storefront/account/types'

export type RefreshUserAvatarCachesOptions = {
  queryClient: QueryClient
  imageUrl: string | null
  /** Better Auth `useSession().refetch` — updates navbar session.user.image */
  refetchSession?: () => Promise<unknown>
  /** Next.js App Router refresh — revalidates server-rendered session props */
  routerRefresh?: () => void
}

/**
 * Keeps avatar UI in sync after a successful upload without a full page reload.
 *
 * 1. Patches `meProfile` cache immediately (account page, sidebar, cards).
 * 2. Invalidates profile + summary for background consistency.
 * 3. Refetches Better Auth session (navbar).
 * 4. Optionally triggers `router.refresh()` for server components.
 */
export async function refreshUserAvatarCaches({
  queryClient,
  imageUrl,
  refetchSession,
  routerRefresh,
}: RefreshUserAvatarCachesOptions): Promise<void> {
  queryClient.setQueryData<AccountUser>(accountQueryKeys.profile(), (current) => {
    if (!current) return current
    return { ...current, image: imageUrl }
  })

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: accountQueryKeys.profile() }),
    queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() }),
  ])

  if (refetchSession) {
    await refetchSession()
  }

  routerRefresh?.()
}
