import 'server-only'

import { EmailProvider, EmailStatus, type Prisma, type PrismaClient } from '@prisma/client'

import { prisma } from '@/src/server/db/prisma'

import { resolveEmailSubject, renderTransactionalTemplate } from './email.templates'
import { sendWithEmailProvider } from './email.providers'
import type {
  LogicalEmailProvider,
  SendTransactionalEmailInput,
  SendTransactionalEmailResult,
  TransactionalEmailPayload,
  TransactionalEmailTemplate,
} from './email.types'

function toPrismaProvider(logical: LogicalEmailProvider): EmailProvider {
  if (logical === 'resend') return EmailProvider.RESEND
  return EmailProvider.OTHER
}

function buildMetadata(
  input: SendTransactionalEmailInput,
  logicalProvider: LogicalEmailProvider,
  extra?: Record<string, unknown>,
): Prisma.InputJsonValue {
  const payload: TransactionalEmailPayload = {
    ...input.payload,
    templateKey: input.templateKey,
    userId: input.userId ?? null,
    guestSessionId: input.guestSessionId ?? null,
  }

  return {
    logicalProvider,
    ...payload,
    ...extra,
  } as Prisma.InputJsonValue
}

/**
 * Returns true if a SENT email already exists for order + template (idempotency).
 */
export async function hasSentTransactionalEmail(
  db: PrismaClient,
  orderId: string,
  templateKey: TransactionalEmailTemplate,
): Promise<boolean> {
  const existing = await db.emailMessage.findFirst({
    where: {
      orderId,
      templateKey,
      status: EmailStatus.SENT,
    },
    select: { id: true },
  })
  return Boolean(existing)
}

/**
 * Sends a transactional email and persists EmailMessage (does not throw on send failure).
 */
export async function sendTransactionalEmail(
  input: SendTransactionalEmailInput,
  db: PrismaClient = prisma,
): Promise<SendTransactionalEmailResult> {
  const rendered = renderTransactionalTemplate(input.templateKey, input.payload)
  const subject = resolveEmailSubject(input.templateKey, input.payload, input.subject)

  const queued = await db.emailMessage.create({
    data: {
      orderId: input.orderId ?? null,
      toEmail: input.to.trim().toLowerCase(),
      subject,
      status: EmailStatus.QUEUED,
      provider: EmailProvider.RESEND,
      templateKey: input.templateKey,
      metadataJson: buildMetadata(input, 'console'),
    },
  })

  try {
    const { logicalProvider, result } = await sendWithEmailProvider({
      to: input.to,
      subject,
      html: rendered.html,
      text: rendered.text,
    })

    const updated = await db.emailMessage.update({
      where: { id: queued.id },
      data: {
        status: EmailStatus.SENT,
        provider: toPrismaProvider(logicalProvider),
        providerMessageId: result.providerMessageId,
        sentAt: new Date(),
        metadataJson: buildMetadata(input, logicalProvider),
      },
    })

    return {
      emailMessageId: updated.id,
      provider: logicalProvider,
      providerMessageId: result.providerMessageId,
      status: 'SENT',
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al enviar email'

    await db.emailMessage.update({
      where: { id: queued.id },
      data: {
        status: EmailStatus.FAILED,
        metadataJson: buildMetadata(input, 'console', { errorMessage }),
      },
    })

    return {
      emailMessageId: queued.id,
      provider: 'console',
      providerMessageId: null,
      status: 'FAILED',
    }
  }
}

/**
 * Sends transactional email without throwing (for checkout / webhooks).
 */
export async function safeSendTransactionalEmail(
  input: SendTransactionalEmailInput,
  db: PrismaClient = prisma,
): Promise<SendTransactionalEmailResult | null> {
  try {
    return await sendTransactionalEmail(input, db)
  } catch (error) {
    console.error('[email:safe-send]', {
      templateKey: input.templateKey,
      orderId: input.orderId,
      message: error instanceof Error ? error.message : error,
    })
    return null
  }
}

/**
 * Idempotent send: skips if SENT already exists for order + template.
 */
export async function safeSendTransactionalEmailOnce(
  input: SendTransactionalEmailInput,
  db: PrismaClient = prisma,
): Promise<SendTransactionalEmailResult | null> {
  if (input.orderId) {
    const alreadySent = await hasSentTransactionalEmail(db, input.orderId, input.templateKey)
    if (alreadySent) return null
  }
  return safeSendTransactionalEmail(input, db)
}
