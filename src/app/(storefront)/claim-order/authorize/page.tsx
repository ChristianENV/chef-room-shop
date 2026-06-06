import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'
import { AuthorizeTransferForm } from '@/src/features/storefront/order-claim-transfer/authorize-transfer-form'
import { loadOrderClaimTransferPreviewAction } from '@/src/features/storefront/order-claim-transfer/actions'
import { routes } from '@/src/config/routes'

type ClaimOrderAuthorizePageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function ClaimOrderAuthorizePage({
  searchParams,
}: ClaimOrderAuthorizePageProps) {
  const params = await searchParams
  const token = params.token?.trim() ?? ''

  if (!token) {
    return (
      <ClaimAuthorizeShell>
        <ErrorCard
          title="Enlace no válido"
          description="Este enlace ya no es válido."
        />
      </ClaimAuthorizeShell>
    )
  }

  const preview = await loadOrderClaimTransferPreviewAction(token)

  if (!preview) {
    return (
      <ClaimAuthorizeShell>
        <ErrorCard
          title="Enlace expirado o inválido"
          description="Este enlace ya no es válido. Si necesitas ayuda, contáctanos."
        />
      </ClaimAuthorizeShell>
    )
  }

  if (preview.status === 'APPROVED') {
    return (
      <ClaimAuthorizeShell>
        <ErrorCard
          title="Autorización ya utilizada"
          description={`El pedido ${preview.orderNumber} ya fue vinculado previamente.`}
        />
      </ClaimAuthorizeShell>
    )
  }

  if (preview.status === 'CANCELLED') {
    return (
      <ClaimAuthorizeShell>
        <ErrorCard
          title="Solicitud cancelada"
          description="Esta solicitud de vinculación fue cancelada y ya no puede usarse."
        />
      </ClaimAuthorizeShell>
    )
  }

  return (
    <ClaimAuthorizeShell>
      <AuthorizeTransferForm token={token} preview={preview} />
    </ClaimAuthorizeShell>
  )
}

function ClaimAuthorizeShell({ children }: { children: React.ReactNode }) {
  return (
    <CheckoutLayout>
      <div className="mx-auto max-w-lg py-8">{children}</div>
    </CheckoutLayout>
  )
}

function ErrorCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      data-testid="claim-transfer-authorize-invalid"
      className="rounded-lg border border-border bg-card p-6 text-center"
    >
      <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="mt-4 font-sans text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 font-serif text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline" className="font-sans">
          <Link href={routes.contact}>Contactar</Link>
        </Button>
        <Button asChild className="font-sans">
          <Link href={routes.shop}>Ir a la tienda</Link>
        </Button>
      </div>
    </div>
  )
}
