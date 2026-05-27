'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  const active = enabled && Boolean(redirectUrl?.trim())
  const [secondsLeft, setSecondsLeft] = useState(PAID_ORDER_REDIRECT_SECONDS)
  const [cancelled, setCancelled] = useState(false)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (!active) {
      hasRedirectedRef.current = false
      setCancelled(false)
      setSecondsLeft(PAID_ORDER_REDIRECT_SECONDS)
      return
    }

    hasRedirectedRef.current = false
    setCancelled(false)
    setSecondsLeft(PAID_ORDER_REDIRECT_SECONDS)
  }, [active, redirectUrl])

  useEffect(() => {
    if (!active || cancelled) return

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [active, cancelled, redirectUrl])

  useEffect(() => {
    if (!active || cancelled || secondsLeft > 0 || !redirectUrl) return
    if (hasRedirectedRef.current) return

    hasRedirectedRef.current = true
    router.push(redirectUrl)
  }, [active, cancelled, secondsLeft, redirectUrl, router])

  const cancelRedirect = useCallback(() => {
    setCancelled(true)
  }, [])

  const activeCountdown = active && !cancelled ? secondsLeft : null

  return { secondsLeft: activeCountdown, cancelRedirect }
}
