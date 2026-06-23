'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  approveOrderClaimTransferAction,
  cancelOrderClaimTransferAction,
} from '@/src/features/storefront/order-claim-transfer/actions'
import { routes } from '@/src/config/routes'
import type { OrderClaimTransferPreview } from '@/src/features/storefront/order-claim-transfer/types'

type AuthorizeTransferFormProps = {
  token: string
  preview: OrderClaimTransferPreview
}

export function AuthorizeTransferForm({ token, preview }: AuthorizeTransferFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    kind: 'approved' | 'cancelled' | 'error'
    message: string
    orderNumber?: string
  } | null>(null)

  const handleApprove = () => {
    startTransition(async () => {
      const response = await approveOrderClaimTransferAction(token)
      if (response.success && response.status === 'APPROVED') {
        setResult({
          kind: 'approved',
          message: response.message ?? 'Pedido vinculado correctamente.',
          orderNumber: response.orderNumber,
        })
        return
      }

      setResult({
        kind: 'error',
        message: response.message ?? 'No pudimos autorizar la vinculación.',
        orderNumber: response.orderNumber,
      })
    })
  }

  const handleCancel = () => {
    startTransition(async () => {
      const response = await cancelOrderClaimTransferAction(token)
      if (response.success && response.status === 'CANCELLED') {
        setResult({
          kind: 'cancelled',
          message: response.message ?? 'Solicitud cancelada.',
          orderNumber: response.orderNumber,
        })
        return
      }

      setResult({
        kind: 'error',
        message: response.message ?? 'No pudimos cancelar la solicitud.',
        orderNumber: response.orderNumber,
      })
    })
  }

  if (result?.kind === 'approved' && result.orderNumber) {
    return (
      <div
        data-testid="claim-transfer-authorize-success"
        className="rounded-lg border border-success/30 bg-success/10 p-6 text-center"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden />
        <h1 className="mt-4 font-sans text-xl font-bold text-foreground">Vinculación autorizada</h1>
        <p className="mt-2 font-serif text-sm text-muted-foreground">{result.message}</p>
        <p className="mt-2 font-serif text-sm text-muted-foreground">
          Pedido <strong>{result.orderNumber}</strong>
        </p>
      </div>
    )
  }

  if (result?.kind === 'cancelled') {
    return (
      <div
        data-testid="claim-transfer-authorize-cancelled"
        className="rounded-lg border border-border bg-card p-6 text-center"
      >
        <h1 className="font-sans text-xl font-bold text-foreground">Solicitud cancelada</h1>
        <p className="mt-2 font-serif text-sm text-muted-foreground">{result.message}</p>
        {result.orderNumber ? (
          <p className="mt-2 font-serif text-sm text-muted-foreground">
            Pedido <strong>{result.orderNumber}</strong>
          </p>
        ) : null}
      </div>
    )
  }

  if (result?.kind === 'error') {
    return (
      <div data-testid="claim-transfer-authorize-error">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{result.message}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="font-sans">
          <Link href={routes.contact}>Contactar soporte</Link>
        </Button>
      </div>
    )
  }

  return (
    <div
      data-testid="claim-transfer-authorize-confirm"
      className="rounded-lg border border-border bg-card p-6 md:p-8"
    >
      <h1 className="font-sans text-xl font-bold text-foreground">
        Autorizar vinculación del pedido
      </h1>
      <p className="mt-3 font-serif text-sm text-muted-foreground">
        Alguien solicitó guardar el pedido <strong>{preview.orderNumber}</strong> en otra cuenta.
      </p>

      <dl className="mt-4 space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
          <dt className="font-serif text-xs text-muted-foreground">Correo de la compra</dt>
          <dd className="font-sans text-sm font-medium text-foreground">
            {preview.maskedOrderEmail}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
          <dt className="font-serif text-xs text-muted-foreground">Cuenta solicitante</dt>
          <dd className="font-sans text-sm font-medium text-foreground">
            {preview.maskedRequestedByEmail}
          </dd>
        </div>
      </dl>

      <p className="mt-4 font-serif text-xs leading-relaxed text-muted-foreground">
        Si reconoces esta solicitud, autoriza la vinculación. Si no la reconoces, cancela o ignora
        esta página.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          className="font-sans"
          disabled={isPending}
          data-testid="claim-transfer-authorize-button"
          onClick={handleApprove}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Autorizar vinculación
        </Button>
        <Button
          type="button"
          variant="outline"
          className="font-sans"
          disabled={isPending}
          data-testid="claim-transfer-cancel-button"
          onClick={handleCancel}
        >
          No autorizar
        </Button>
      </div>
    </div>
  )
}
