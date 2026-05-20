import 'server-only'

/** Logical transactional templates (v1). */
export type TransactionalEmailTemplate =
  | 'order_created'
  | 'payment_confirmed'
  | 'payment_failed'
  | 'payment_expired'
  | 'email_verification'

/** Configured delivery channel (may map to Prisma `EmailProvider.OTHER`). */
export type LogicalEmailProvider = 'console' | 'resend' | 'mailtrap'

export type SendTransactionalEmailInput = {
  to: string
  templateKey: TransactionalEmailTemplate
  subject: string
  payload: TransactionalEmailPayload
  userId?: string | null
  guestSessionId?: string | null
  orderId?: string | null
}

/** Safe subset stored in `EmailMessage.metadataJson` (no Conekta/raw card data). */
export type TransactionalEmailPayload = {
  orderNumber?: string
  totalCents?: number
  currency?: string
  paymentStatus?: string
  orderStatus?: string
  paymentMethod?: string
  templateKey?: TransactionalEmailTemplate
  links?: {
    checkoutSuccessUrl?: string
    accountUrl?: string
    shopUrl?: string
    claimUrl?: string
    accountOrderUrl?: string
  }
  claimUrl?: string
  accountOrderUrl?: string
  verificationUrl?: string
  userId?: string | null
  guestSessionId?: string | null
}

export type SendTransactionalEmailResult = {
  emailMessageId: string
  provider: LogicalEmailProvider
  providerMessageId?: string | null
  status: 'SENT' | 'FAILED' | 'QUEUED'
}

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

export type ProviderSendInput = {
  to: string
  subject: string
  html: string
  text: string
}

export type ProviderSendResult = {
  providerMessageId: string
}
