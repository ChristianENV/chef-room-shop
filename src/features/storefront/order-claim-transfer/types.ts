export type OrderClaimTransferPreview = {
  orderNumber: string
  maskedOrderEmail: string
  maskedRequestedByEmail: string
  expiresAt: Date
  status: 'PENDING' | 'APPROVED' | 'EXPIRED' | 'CANCELLED'
}
