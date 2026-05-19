'use client'

import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/src/lib/auth/auth-client'
import { routes } from '@/src/config/routes'
import { PublicHeader } from './public-header'

/**
 * Storefront header wired to Better Auth session state.
 */
export function PublicNavbarSession() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const user = session?.user
  const isLoggedIn = Boolean(user)
  const userName = user?.name ?? user?.email ?? undefined

  const handleSignOut = async () => {
    await signOut()
    router.push(routes.home)
    router.refresh()
  }

  return (
    <PublicHeader
      isLoggedIn={isLoggedIn && !isPending}
      userName={userName}
      onSignOut={handleSignOut}
    />
  )
}
