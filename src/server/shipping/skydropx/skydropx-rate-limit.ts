import 'server-only'

/** Skydropx PRO documents a limit of 2 requests per second. */
const MIN_INTERVAL_MS = 500

let lastRequestAt = 0
let chain: Promise<unknown> = Promise.resolve()

/**
 * Schedules a Skydropx API call respecting a simple per-instance throttle.
 *
 * On Vercel/serverless each instance has its own queue; global rate limits may
 * still apply at the account level. Use Redis-backed scheduling if needed later.
 */
export function scheduleSkydropxRequest<T>(fn: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const now = Date.now()
    const elapsed = now - lastRequestAt
    const wait = Math.max(0, MIN_INTERVAL_MS - elapsed)
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait))
    }
    lastRequestAt = Date.now()
    return fn()
  }

  const result = chain.then(run, run) as Promise<T>
  chain = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}
