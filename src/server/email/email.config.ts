import 'server-only'

import { EmailConfigError } from './email.errors'
import type { LogicalEmailProvider } from './email.types'

export type EmailConfig = {
  provider: LogicalEmailProvider
  from: string
  resendApiKey: string
  mailtrapToken: string
  mailtrapInboxId: string
  /** True when NODE_ENV=test, CI=true, or DISABLE_EMAIL_SENDS=true. */
  isEmailDisabled: boolean
}

/**
 * Returns true when the runtime environment must never send real emails.
 * Checked independently of EMAIL_PROVIDER so misconfigured envs are always safe.
 */
export function isEmailForciblyDisabled(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.CI === 'true' ||
    process.env.DISABLE_EMAIL_SENDS === 'true'
  )
}

/**
 * Reads email configuration from environment (missing keys do not break build).
 */
export function getEmailConfig(): EmailConfig {
  const providerRaw = (process.env.EMAIL_PROVIDER ?? 'console').trim().toLowerCase()
  const provider: LogicalEmailProvider =
    providerRaw === 'resend' || providerRaw === 'mailtrap' ? providerRaw : 'console'

  return {
    provider,
    from: process.env.EMAIL_FROM?.trim() || 'Chef Room <no-reply@chefroom.mx>',
    resendApiKey: process.env.RESEND_API_KEY?.trim() ?? '',
    mailtrapToken: process.env.MAILTRAP_TOKEN?.trim() ?? '',
    mailtrapInboxId: process.env.MAILTRAP_INBOX_ID?.trim() ?? '',
    isEmailDisabled: isEmailForciblyDisabled(),
  }
}

/**
 * Resolves the active logical provider.
 *
 * Hard guardrails — always returns `'disabled'` when:
 *   - NODE_ENV === 'test'
 *   - CI === 'true'
 *   - DISABLE_EMAIL_SENDS === 'true'
 *
 * In all three cases, if a real provider (resend / mailtrap) was configured, a
 * server-side warning is emitted so the misconfiguration is visible in logs.
 */
export function resolveActiveEmailProvider(config: EmailConfig): LogicalEmailProvider {
  if (config.isEmailDisabled) {
    if (config.provider === 'resend' || config.provider === 'mailtrap') {
      console.warn(
        `[email] Email provider disabled in test/CI environment. ` +
          `Configured provider "${config.provider}" will NOT be used.`,
      )
    }
    return 'disabled'
  }

  if (config.provider === 'resend') {
    if (!config.resendApiKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new EmailConfigError(
          'EMAIL_PROVIDER=resend pero falta RESEND_API_KEY en el servidor.',
        )
      }
      return 'console'
    }
    return 'resend'
  }

  if (config.provider === 'mailtrap') {
    if (!config.mailtrapToken) {
      if (process.env.NODE_ENV === 'production') {
        throw new EmailConfigError(
          'EMAIL_PROVIDER=mailtrap pero falta MAILTRAP_TOKEN en el servidor.',
        )
      }
      return 'console'
    }
    return 'mailtrap'
  }

  return 'console'
}
