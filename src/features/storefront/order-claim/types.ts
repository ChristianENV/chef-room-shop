export type OrderClaimPreview = {
  orderNumber: string
  maskedEmail: string
  status: string
  paymentStatus: string
  expiresAt: string
  alreadyClaimed: boolean
}

export type OrderClaimPayload = {
  success: boolean
  orderNumber: string | null
  redirectTo: string | null
  message: string | null
}
