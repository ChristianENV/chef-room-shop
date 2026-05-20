'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { routes } from '@/src/config/routes'

import { isAccountUnauthenticated } from './account-errors'

/**
 * Redirects to login when account BFF queries fail due to missing session.
 */
export function useAccountAuthRedirect(isError: boolean, error: unknown) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isError || !isAccountUnauthenticated(error)) return
    const callback = encodeURIComponent(pathname)
    router.replace(`${routes.login}?callbackUrl=${callback}`)
  }, [isError, error, pathname, router])
}
