'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/src/lib/auth/auth-client'
import { routes } from '@/src/config/routes'
import { getCurrentUserRedirectAction } from '@/src/server/auth/actions'
import { PublicHeader } from './public-header'

/**
 * Storefront header wired to Better Auth session state.
 */
export function PublicNavbarSession() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [customerTier, setCustomerTier] = useState<string | null>(null)

  const user = session?.user
  const isLoggedIn = Boolean(user)

  useEffect(() => {
    if (!session?.user?.id) return

    let cancelled = false

    getCurrentUserRedirectAction()
      .then((result) => {
        if (!cancelled) {
          setIsAdmin(result.isAdmin)
          setCustomerTier(result.customerTier)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false)
          setCustomerTier(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const handleSignOut = async () => {
    await signOut()
    router.push(routes.home)
    router.refresh()
  }

  return (
    <PublicHeader
      isLoggedIn={isLoggedIn && !isPending}
      user={user}
      isAdmin={isAdmin}
      customerTier={customerTier}
      onSignOut={handleSignOut}
    />
  )
}
