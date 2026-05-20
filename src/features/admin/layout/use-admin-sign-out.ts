'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { signOut } from '@/src/lib/auth/auth-client'
import { routes } from '@/src/config/routes'

/**
 * Signs out the current user and redirects to the admin login page.
 */
export function useAdminSignOut() {
  const router = useRouter()

  return useCallback(async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(routes.adminLogin)
          router.refresh()
        },
      },
    })
  }, [router])
}
