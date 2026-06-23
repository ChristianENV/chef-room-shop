import { mergeCurrentGuestSessionAction } from '@/src/server/auth/actions'

/**
 * Runs guest session merge after storefront login/register.
 * Non-blocking: failures do not prevent navigation.
 */
export async function runPostAuthGuestMerge(): Promise<void> {
  try {
    const result = await mergeCurrentGuestSessionAction()
    if (result?.conflict && process.env.NODE_ENV === 'development') {
      console.warn('[guest-merge] Guest session already linked to another account.', result)
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[guest-merge] Non-critical merge failure:', error)
    }
  }
}
