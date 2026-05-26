'use client'

import { CreditCard, MapPin, User } from 'lucide-react'

import type { AdminOrdersUiOrder } from '../types/admin-orders-ui.types'

type AdminOrderCustomerInfoCardProps = {
  order: AdminOrdersUiOrder
}

function AddressBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof User
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/80 bg-muted/20 p-4">
      <h4 className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {title}
      </h4>
      <div className="space-y-1 font-serif text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  )
}

export function AdminOrderCustomerInfoCard({ order }: AdminOrderCustomerInfoCardProps) {
  const { customer, shippingAddress, billingAddress } = order

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <AddressBlock title="Cliente" icon={User}>
        <p className="font-sans text-base font-medium">{customer.name}</p>
        <p className="break-all text-muted-foreground">{customer.email}</p>
        <p className="text-muted-foreground">{customer.phone}</p>
      </AddressBlock>

      <AddressBlock title="Dirección de envío" icon={MapPin}>
        <p className="font-sans font-medium">
          {shippingAddress.firstName} {shippingAddress.lastName}
        </p>
        <p>
          {shippingAddress.street}
          {shippingAddress.interiorNumber ? `, ${shippingAddress.interiorNumber}` : ''}
        </p>
        {shippingAddress.neighborhood ? <p>{shippingAddress.neighborhood}</p> : null}
        <p>
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
        </p>
        <p>{shippingAddress.country}</p>
        {shippingAddress.phone && shippingAddress.phone !== '—' ? (
          <p className="pt-1 text-muted-foreground">Tel. {shippingAddress.phone}</p>
        ) : null}
      </AddressBlock>

      {billingAddress ? (
        <AddressBlock title="Facturación" icon={CreditCard}>
          <p className="font-sans font-medium">
            {billingAddress.firstName} {billingAddress.lastName}
          </p>
          <p>{billingAddress.street}</p>
          <p>
            {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
          </p>
          <p>{billingAddress.country}</p>
        </AddressBlock>
      ) : (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 p-4">
          <p className="text-center font-serif text-sm text-muted-foreground">
            Sin dirección de facturación distinta al envío.
          </p>
        </div>
      )}
    </div>
  )
}
