'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { login } from '@/src/config/routes'

import { isAccountUnauthenticated } from './account-errors'

/**
 * Redirects to login when account BFF queries fail due to missing session.
 */
export function useAccountAuthRedirect(
  isError: boolean,
  error: unknown,
  options?: { enabled?: boolean; callbackUrl?: string },
) {
  const router = useRouter()
  const pathname = usePathname()
  const enabled = options?.enabled ?? true

  useEffect(() => {
    if (!enabled || !isError || !isAccountUnauthenticated(error)) {
      return
    }

    const returnPath = options?.callbackUrl ?? pathname
    router.replace(login({ callbackUrl: returnPath }))
  }, [enabled, isError, error, options?.callbackUrl, pathname, router])
}
