'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export const PAID_ORDER_REDIRECT_SECONDS = 8

/**
 * Counts down and redirects to the order page after payment is confirmed.
 */
export function usePaidOrderRedirectCountdown(
  enabled: boolean,
  redirectUrl: string | null,
): { secondsLeft: number | null; cancelRedirect: () => void } {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(PAID_ORDER_REDIRECT_SECONDS)
  const [cancelled, setCancelled] = useState(false)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !redirectUrl || cancelled) {
      setSecondsLeft(PAID_ORDER_REDIRECT_SECONDS)
      hasRedirectedRef.current = false
      return
    }

    setSecondsLeft(PAID_ORDER_REDIRECT_SECONDS)
    hasRedirectedRef.current = false

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true
            router.push(redirectUrl)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [enabled, redirectUrl, cancelled, router])

  const cancelRedirect = () => setCancelled(true)

  const activeCountdown =
    enabled && redirectUrl && !cancelled ? secondsLeft : null

  return { secondsLeft: activeCountdown, cancelRedirect }
}
