import { centsToPesos } from '@/src/lib/formatters'
import {
  getCartItemCustomizationSummary,
  getCartItemDisplayImage,
  mapBffCartToCartPage,
} from '@/src/features/storefront/cart/mappers/cart-ui.mapper'

import type { Cart } from '@/src/features/storefront/cart/types/cart-bff.types'
import type { AccountAddress, AccountUser } from '@/src/features/storefront/account/types'
import type { CreateCheckoutOrderInput } from '../types'
import type { ContactFormData } from '../contact-form'
import type { ShippingAddressData } from '../shipping-address-form'
import type { BillingAddressData } from '../billing-address-form'
import type { PaymentMethod } from '../payment-method-tabs'
import type { SelectedShippingRateSummary } from '../types/checkout-shipping.types'
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
    extNumber: data.exteriorNumber.trim(),
    intNumber: data.interiorNumber?.trim() || null,
    neighborhood: data.neighborhood.trim(),
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
        item.designId || item.customizationPriceCents > 0 || getCartItemCustomizationSummary(item),
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
  selectedShipping?: SelectedShippingRateSummary | null
}): CreateCheckoutOrderInput {
  const shippingAddress = mapAddressToBffInput(params.shipping, params.contact.phone)

  const input: CreateCheckoutOrderInput = {
    email: params.contact.email.trim(),
    phone: params.contact.phone.trim(),
    shippingAddress,
    useSameBillingAddress: params.billing.sameAsShipping,
    paymentMethod: mapPaymentMethodToBff(params.paymentMethod),
    notes: params.notes?.trim() || null,
    shippingRateId: params.selectedShipping?.rateId ?? null,
  }

  if (!params.billing.sameAsShipping) {
    input.billingAddress = mapAddressToBffInput(params.billing, params.contact.phone)
  }

  return input
}

function mapAccountAddressToShippingForm(address: AccountAddress): ShippingAddressData {
  return {
    firstName: address.firstName ?? '',
    lastName: address.lastName ?? '',
    street: address.street,
    exteriorNumber: address.extNumber ?? '',
    interiorNumber: address.intNumber ?? '',
    neighborhood: address.neighborhood ?? '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country === 'MX' ? 'Mexico' : address.country,
    saveAddress: false,
  }
}

/**
 * Prefills checkout form fields from authenticated profile + saved addresses.
 */
export function mapProfileAndAddressToCheckoutForm(input: {
  profile: AccountUser
  addresses: AccountAddress[]
}): {
  contact: ContactFormData
  shipping: ShippingAddressData | null
  billing: BillingAddressData | null
} {
  const contact: ContactFormData = {
    email: input.profile.email,
    phone: input.profile.phone ?? '',
  }

  const shippingAddress =
    input.addresses.find((a) => a.isDefault && (a.type === 'SHIPPING' || a.type === 'BOTH')) ??
    input.addresses.find((a) => a.type === 'SHIPPING' || a.type === 'BOTH') ??
    input.addresses[0] ??
    null

  const billingAddress =
    input.addresses.find((a) => a.isDefault && (a.type === 'BILLING' || a.type === 'BOTH')) ??
    input.addresses.find((a) => a.type === 'BILLING') ??
    null

  return {
    contact,
    shipping: shippingAddress ? mapAccountAddressToShippingForm(shippingAddress) : null,
    billing: billingAddress
      ? {
          sameAsShipping: false,
          ...mapAccountAddressToShippingForm(billingAddress),
        }
      : null,
  }
}
