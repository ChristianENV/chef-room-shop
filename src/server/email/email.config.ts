import 'server-only'

import { EmailConfigError } from './email.errors'
import type { LogicalEmailProvider } from './email.types'

export type EmailConfig = {
  provider: LogicalEmailProvider
  from: string
  resendApiKey: string
  mailtrapToken: string
  mailtrapInboxId: string
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
  }
}

/**
 * Resolves the active logical provider (auto-fallback to console when keys missing in dev).
 */
export function resolveActiveEmailProvider(config: EmailConfig): LogicalEmailProvider {
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
