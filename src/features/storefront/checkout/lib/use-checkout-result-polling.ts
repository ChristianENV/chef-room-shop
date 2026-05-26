'use client'

import { useEffect, useRef } from 'react'

import {
  CHECKOUT_POLL_FAST_INTERVAL_MS,
  CHECKOUT_POLL_FAST_MAX_ATTEMPTS,
  CHECKOUT_POLL_SLOW_INTERVAL_MS,
  CHECKOUT_POLL_SLOW_MAX_ATTEMPTS,
} from './checkout-polling.config'

type UseCheckoutResultPollingOptions = {
  shouldPoll: boolean
  refetch: () => Promise<unknown>
  resetKey: string
}

/**
 * Two-tier polling: fast (~4s × 8) then slow (~12s × 10) while payment is pending.
 */
export function useCheckoutResultPolling({
  shouldPoll,
  refetch,
  resetKey,
}: UseCheckoutResultPollingOptions): void {
  const pollAttemptsRef = useRef(0)

  useEffect(() => {
    pollAttemptsRef.current = 0
  }, [resetKey])

  useEffect(() => {
    if (!shouldPoll) {
      return
    }

    let cancelled = false
    let timeoutId: number | undefined

    const scheduleNext = () => {
      if (cancelled) {
        return
      }

      pollAttemptsRef.current += 1
      const maxAttempts = CHECKOUT_POLL_FAST_MAX_ATTEMPTS + CHECKOUT_POLL_SLOW_MAX_ATTEMPTS
      if (pollAttemptsRef.current > maxAttempts) {
        return
      }

      void refetch()

      const delayMs =
        pollAttemptsRef.current < CHECKOUT_POLL_FAST_MAX_ATTEMPTS
          ? CHECKOUT_POLL_FAST_INTERVAL_MS
          : CHECKOUT_POLL_SLOW_INTERVAL_MS

      timeoutId = window.setTimeout(scheduleNext, delayMs)
    }

    timeoutId = window.setTimeout(scheduleNext, CHECKOUT_POLL_FAST_INTERVAL_MS)

    return () => {
      cancelled = true
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [shouldPoll, refetch, resetKey])
}
