'use client'

import { CreditCard } from 'lucide-react'

type AdminPaymentsEmptyProps = {
  title?: string
  description?: string
}

export function AdminPaymentsEmpty({
  title = 'Sin pagos',
  description = 'No encontramos pagos con estos filtros.',
}: AdminPaymentsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 px-4 text-center">
      <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="font-sans text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md font-serif text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
