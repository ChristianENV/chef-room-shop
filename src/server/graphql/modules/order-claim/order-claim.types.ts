export type OrderClaimPreviewGql = {
  orderNumber: string
  maskedEmail: string
  status: string
  paymentStatus: string
  expiresAt: string
  alreadyClaimed: boolean
}

export type OrderClaimPayloadGql = {
  success: boolean
  orderNumber: string | null
  redirectTo: string | null
  message: string | null
}
