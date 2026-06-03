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
  const trimmedRedirectUrl = redirectUrl?.trim() ?? ''
  const active = enabled && trimmedRedirectUrl.length > 0
  const activeKey = active ? trimmedRedirectUrl : null

  const [trackedActiveKey, setTrackedActiveKey] = useState(activeKey)
  const [secondsLeft, setSecondsLeft] = useState(PAID_ORDER_REDIRECT_SECONDS)
  const [cancelled, setCancelled] = useState(false)
  const hasRedirectedRef = useRef(false)

  if (trackedActiveKey !== activeKey) {
    setTrackedActiveKey(activeKey)
    setSecondsLeft(PAID_ORDER_REDIRECT_SECONDS)
    setCancelled(false)
  }

  useEffect(() => {
    hasRedirectedRef.current = false
  }, [activeKey])

  useEffect(() => {
    if (!active || cancelled) return

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [active, cancelled, activeKey])

  useEffect(() => {
    if (!active || cancelled || secondsLeft > 0) return
    if (hasRedirectedRef.current) return

    hasRedirectedRef.current = true
    router.push(trimmedRedirectUrl)
  }, [active, cancelled, secondsLeft, trimmedRedirectUrl, router])

  const cancelRedirect = useCallback(() => {
    setCancelled(true)
  }, [])

  const activeCountdown = active && !cancelled ? secondsLeft : null

  return { secondsLeft: activeCountdown, cancelRedirect }
}
