/** Conekta hosted checkout block on order create. */
export type ConektaCheckoutRequest = {
  type: 'HostedPayment'
  allowed_payment_methods: Array<'card' | 'cash' | 'bank_transfer'>
  success_url: string
  failure_url: string
  monthly_installments_enabled?: boolean
  redirection_time?: number
}

export type ConektaLineItemRequest = {
  name: string
  unit_price: number
  quantity: number
  description?: string
  sku?: string
}

export type ConektaCreateOrderRequest = {
  currency: string
  customer_info: {
    name: string
    email: string
    phone?: string
  }
  line_items: ConektaLineItemRequest[]
  shipping_lines?: Array<{ amount: number; carrier?: string }>
  checkout: ConektaCheckoutRequest
  metadata?: Record<string, string>
}

export type ConektaCheckoutResponse = {
  id?: string
  object?: string
  type?: string
  status?: string
  url?: string
  allowed_payment_methods?: string[]
}

export type ConektaOrderResponse = {
  id: string
  object?: string
  currency?: string
  amount?: number
  payment_status?: string
  livemode?: boolean
  checkout?: ConektaCheckoutResponse
  charges?: {
    data?: Array<{
      id?: string
      status?: string
      payment_status?: string
      payment_method?: { type?: string }
    }>
  }
}

export type ConektaWebhookPayload = {
  id?: string
  type?: string
  livemode?: boolean
  data?: {
    object?: Record<string, unknown>
  }
}
