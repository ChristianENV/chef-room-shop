import { centsToPesos } from '@/src/lib/formatters'
import {
  getCartItemCustomizationSummary,
  getCartItemDisplayImage,
  mapBffCartToCartPage,
} from '@/src/features/storefront/cart/mappers/cart-ui.mapper'

import type { Cart } from '@/src/features/storefront/cart/types/cart-bff.types'
import type { CreateCheckoutOrderInput } from '../types'
import type { ContactFormData } from '../contact-form'
import type { ShippingAddressData } from '../shipping-address-form'
import type { BillingAddressData } from '../billing-address-form'
import type { PaymentMethod } from '../payment-method-tabs'
import { mapPaymentMethodToBff, normalizeCountryCode } from '../lib/checkout-form.validation'

export type CheckoutSummaryItem = {
  id: string
  name: string
  sizeLabel: string
  colorName: string
  quantity: number
  lineTotalPesos: number
  imageUrl?: string
  isCustomized: boolean
}

export type CheckoutSummaryData = {
  items: CheckoutSummaryItem[]
  subtotalPesos: number
  customizationTotalPesos: number
  shippingPesos: number
  discountPesos: number
  totalPesos: number
  totalItems: number
}

function mapAddressToBffInput(
  data: Pick<
    ShippingAddressData,
    | 'firstName'
    | 'lastName'
    | 'street'
    | 'exteriorNumber'
    | 'interiorNumber'
    | 'neighborhood'
    | 'city'
    | 'state'
    | 'postalCode'
    | 'country'
  >,
  phone: string,
) {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    phone,
    street: data.street,
    extNumber: data.exteriorNumber || null,
    intNumber: data.interiorNumber || null,
    neighborhood: data.neighborhood || null,
    city: data.city,
    state: data.state,
    country: normalizeCountryCode(data.country),
    postalCode: data.postalCode,
    references: null,
  }
}

/**
 * Maps BFF cart to checkout order summary display (amounts in pesos).
 */
export function mapBffCartToCheckoutSummary(cart: Cart): CheckoutSummaryData {
  const page = mapBffCartToCartPage(cart)

  const items: CheckoutSummaryItem[] = cart.items.map((item) => {
    const uiItem = page.items.find((row) => row.id === item.id)
    const lineTotalPesos = uiItem
      ? (uiItem.unitPrice + (uiItem.customizationPrice ?? 0)) * uiItem.quantity
      : centsToPesos(item.unitPriceCents + item.customizationPriceCents) * item.quantity

    return {
      id: item.id,
      name: item.productSnapshot?.name ?? uiItem?.productName ?? 'Producto',
      sizeLabel: item.productSnapshot?.sizeName ?? uiItem?.size ?? '—',
      colorName: item.productSnapshot?.colorName ?? uiItem?.colorName ?? '—',
      quantity: item.quantity,
      lineTotalPesos,
      imageUrl: getCartItemDisplayImage(item),
      isCustomized: Boolean(
        item.designId ||
          item.customizationPriceCents > 0 ||
          getCartItemCustomizationSummary(item),
      ),
    }
  })

  return {
    items,
    subtotalPesos: page.subtotal,
    customizationTotalPesos: page.customizationTotal,
    shippingPesos: centsToPesos(cart.shippingCostCents),
    discountPesos: centsToPesos(cart.discountTotalCents),
    totalPesos: page.total,
    totalItems: cart.totalItems,
  }
}

/**
 * Builds the GraphQL createCheckoutOrder input from checkout form state.
 */
export function buildCreateCheckoutOrderInput(params: {
  contact: ContactFormData
  shipping: ShippingAddressData
  billing: BillingAddressData
  paymentMethod: PaymentMethod
  notes?: string
}): CreateCheckoutOrderInput {
  const shippingAddress = mapAddressToBffInput(params.shipping, params.contact.phone)

  const input: CreateCheckoutOrderInput = {
    email: params.contact.email.trim(),
    phone: params.contact.phone.trim(),
    shippingAddress,
    useSameBillingAddress: params.billing.sameAsShipping,
    paymentMethod: mapPaymentMethodToBff(params.paymentMethod),
    notes: params.notes?.trim() || null,
  }

  if (!params.billing.sameAsShipping) {
    input.billingAddress = mapAddressToBffInput(params.billing, params.contact.phone)
  }

  return input
}
