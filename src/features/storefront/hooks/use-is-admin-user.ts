'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/src/lib/auth/auth-client'
import { getCurrentUserRedirectAction } from '@/src/server/auth/actions'

/** True when the signed-in user has admin panel access (ADMIN / SUPERADMIN). */
export function useIsAdminUser(): boolean {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) {
      setIsAdmin(false)
      return
    }

    let cancelled = false

    getCurrentUserRedirectAction()
      .then((result) => {
        if (!cancelled) setIsAdmin(result.isAdmin)
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  return isAdmin
}
