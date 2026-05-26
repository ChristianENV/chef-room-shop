'use client'

import { useEffect, useState } from 'react'

import { CHECKOUT_CONFIRMATION_VISUAL_MS } from './checkout-polling.config'

/**
 * Tracks elapsed ms for the visual confirmation window (0 … durationMs).
 */
export function usePaymentConfirmationElapsed(
  active: boolean,
  startedAt: number,
  durationMs: number = CHECKOUT_CONFIRMATION_VISUAL_MS,
): number {
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (!active) {
      return
    }

    const tick = () => {
      const next = Math.min(Date.now() - startedAt, durationMs)
      setElapsedMs(next)
    }

    tick()
    const intervalId = window.setInterval(tick, 200)
    return () => window.clearInterval(intervalId)
  }, [active, startedAt, durationMs])

  return elapsedMs
}
