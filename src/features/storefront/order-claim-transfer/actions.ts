'use server'

import {
  approveOrderClaimTransfer,
  cancelOrderClaimTransfer,
  getOrderClaimTransferPreview,
} from '@/src/server/orders/order-claim-transfer.service'

export async function loadOrderClaimTransferPreviewAction(token: string) {
  return getOrderClaimTransferPreview(token)
}

export async function approveOrderClaimTransferAction(token: string) {
  return approveOrderClaimTransfer(token)
}

export async function cancelOrderClaimTransferAction(token: string) {
  return cancelOrderClaimTransfer(token)
}
