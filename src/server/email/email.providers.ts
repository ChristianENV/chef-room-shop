import 'server-only'

import { Resend } from 'resend'

import { getEmailConfig, resolveActiveEmailProvider } from './email.config'
import { EmailConfigError, EmailProviderError } from './email.errors'
import type { LogicalEmailProvider, ProviderSendInput, ProviderSendResult } from './email.types'

/**
 * Sends via the configured logical provider.
 */
export async function sendWithEmailProvider(
  input: ProviderSendInput,
): Promise<{ logicalProvider: LogicalEmailProvider; result: ProviderSendResult }> {
  const config = getEmailConfig()
  const logicalProvider = resolveActiveEmailProvider(config)

  switch (logicalProvider) {
    case 'console':
      return { logicalProvider, result: await sendWithConsole(input) }
    case 'resend':
      return { logicalProvider, result: await sendWithResend(input, config) }
    case 'mailtrap':
      return { logicalProvider, result: await sendWithMailtrap(input, config) }
    default:
      return { logicalProvider: 'console', result: await sendWithConsole(input) }
  }
}

/**
 * Logs email to server console (development / fallback).
 */
async function sendWithConsole(input: ProviderSendInput): Promise<ProviderSendResult> {
  const preview = input.text.slice(0, 400)
  console.info('[email:console]', {
    to: input.to,
    subject: input.subject,
    preview,
  })
  return { providerMessageId: `console_${Date.now()}` }
}

/**
 * Sends via Resend API.
 */
async function sendWithResend(
  input: ProviderSendInput,
  config: ReturnType<typeof getEmailConfig>,
): Promise<ProviderSendResult> {
  if (!config.resendApiKey) {
    throw new EmailConfigError('RESEND_API_KEY no configurada.')
  }

  const resend = new Resend(config.resendApiKey)
  const { data, error } = await resend.emails.send({
    from: config.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  })

  if (error) {
    throw new EmailProviderError(error.message, error)
  }

  return { providerMessageId: data?.id ?? `resend_${Date.now()}` }
}

/**
 * Sends via Mailtrap Email Sending API (optional).
 * @see https://help.mailtrap.io/article/121-send-email-via-api
 */
async function sendWithMailtrap(
  input: ProviderSendInput,
  config: ReturnType<typeof getEmailConfig>,
): Promise<ProviderSendResult> {
  if (!config.mailtrapToken) {
    throw new EmailConfigError('MAILTRAP_TOKEN no configurado.')
  }

  const fromMatch = config.from.match(/<([^>]+)>/)
  const fromEmail = fromMatch?.[1] ?? config.from
  const fromName = config.from.includes('<')
    ? config.from.replace(/<[^>]+>/, '').trim()
    : 'Chef Room'

  const response = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.mailtrapToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: input.to }],
      subject: input.subject,
      text: input.text,
      html: input.html,
      category: 'transactional',
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new EmailProviderError(`Mailtrap API error (${response.status}): ${body}`)
  }

  const json = (await response.json()) as { message_ids?: string[] }
  const messageId = json.message_ids?.[0] ?? `mailtrap_${Date.now()}`
  return { providerMessageId: messageId }
}
