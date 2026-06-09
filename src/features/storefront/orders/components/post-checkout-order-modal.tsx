'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw, Sparkles, UserPlus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { login, postCheckoutOrderDetail, register, routes, verifyEmail } from '@/src/config/routes'
import { maskEmail } from '@/src/lib/email/mask-email'
import { signOut } from '@/src/lib/auth/auth-client'
import { useVerifyMyOrderPaymentMutation } from '@/src/features/storefront/account/api/use-verify-my-order-payment-mutation'
import type {
  AccountOrder,
  AccountOrderPaymentActions,
  AccountPaymentStatusPayload,
} from '@/src/features/storefront/account/types'
import {
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  getOrderStatusTone,
  getPaymentStatusLabel,
  orderHasCustomization,
} from '@/src/features/storefront/account/order-detail/order-detail.utils'
import { CheckoutConektaPay } from '@/src/features/storefront/checkout/checkout-conekta-pay'
import { useRequestOrderClaimTransferMutation } from '@/src/features/storefront/checkout/api/use-request-order-claim-transfer-mutation'
import { useVerifyCheckoutPaymentByTokenMutation } from '@/src/features/storefront/checkout/api/use-verify-checkout-payment-by-token-mutation'
import { CHECKOUT_CONFIRMATION_VISUAL_MS } from '@/src/features/storefront/checkout/lib/checkout-polling.config'
import {
  getPaymentConfirmationActions,
  resolvePaymentConfirmationUxState,
  type PaymentConfirmationUxState,
} from '@/src/features/storefront/checkout/lib/payment-confirmation-state'
import { usePaymentConfirmationElapsed } from '@/src/features/storefront/checkout/lib/use-payment-confirmation-elapsed'
import type { ClaimGuestOrderStatus } from '@/src/features/storefront/checkout/types'

const POLL_INTERVAL_MS = 4_000
const POLL_MAX_ATTEMPTS = 8

type PostCheckoutOrderModalProps = {
  open: boolean
  order: AccountOrder
  orderNumber: string
  checkoutToken: string
  isGuest: boolean
  isAuthenticatedOwner: boolean
  viewerEmailMatchesOrder: boolean
  maskedCustomerEmail?: string
  maskedSessionEmail?: string
  paymentActions: AccountOrderPaymentActions
  onOpenChange?: (open: boolean) => void
  onOrderUpdated?: (payload: AccountPaymentStatusPayload) => void
  claimStatus?: ClaimGuestOrderStatus | null
  isClaimingOrder?: boolean
  claimMessage?: string | null
  orderLinkedToAccount?: boolean
}

function isPaidStatus(orderStatus: string, paymentStatus: string): boolean {
  return orderStatus === 'PAID' || paymentStatus === 'PAID'
}

function getStateTestId(state: PaymentConfirmationUxState): string {
  switch (state) {
    case 'loading':
    case 'confirming':
      return 'post-checkout-payment-checking'
    case 'paid':
      return 'post-checkout-payment-confirmed'
    case 'failed':
      return 'post-checkout-payment-failed'
    case 'pendingAfterTimeout':
      return 'post-checkout-payment-timeout'
    default:
      return 'post-checkout-payment-pending'
  }
}

function getModalCopy(state: PaymentConfirmationUxState): { title: string; description: string } {
  switch (state) {
    case 'loading':
    case 'confirming':
      return {
        title: 'Estamos confirmando tu pago',
        description:
          'Validamos la respuesta de Conekta. Esto puede tardar unos segundos.',
      }
    case 'paid':
      return {
        title: 'Pago confirmado',
        description:
          'Tu compra fue recibida correctamente. Ya puedes consultar el detalle y seguimiento de tu pedido.',
      }
    case 'failed':
      return {
        title: 'Pago no aprobado',
        description:
          'No pudimos confirmar el pago. Puedes verificar nuevamente o intentar de nuevo si está disponible.',
      }
    case 'pendingAfterTimeout':
      return {
        title: 'Seguimos esperando confirmación del pago',
        description:
          'Tu pedido fue creado, pero Conekta aún no confirma el pago. Puedes verificar manualmente.',
      }
    case 'expired':
    case 'cancelled':
      return {
        title: 'Pago pendiente',
        description:
          'El intento de pago expiró o fue cancelado. Genera un nuevo intento para continuar.',
      }
    default:
      return {
        title: 'Tu pago está pendiente',
        description: 'Estamos procesando la información de tu compra.',
      }
  }
}

/**
 * Blocking post-checkout modal over the real account order detail page.
 */
export function PostCheckoutOrderModal({
  open,
  order,
  orderNumber,
  checkoutToken,
  isGuest,
  isAuthenticatedOwner,
  viewerEmailMatchesOrder,
  maskedCustomerEmail,
  maskedSessionEmail,
  paymentActions,
  onOpenChange,
  onOrderUpdated,
  claimStatus = null,
  isClaimingOrder = false,
  claimMessage = null,
  orderLinkedToAccount = false,
}: PostCheckoutOrderModalProps) {
  const router = useRouter()
  const [startedAt] = useState(() => Date.now())
  const pollAttemptsRef = useRef(0)
  const pollTimeoutRef = useRef<number | undefined>(undefined)
  const runVerifyLatestRef = useRef<() => void>(() => {})

  const [verifyResult, setVerifyResult] = useState<AccountPaymentStatusPayload | null>(null)
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null)

  const tokenVerifyMutation = useVerifyCheckoutPaymentByTokenMutation(orderNumber, checkoutToken)
  const authVerifyMutation = useVerifyMyOrderPaymentMutation(orderNumber)
  const transferMutation = useRequestOrderClaimTransferMutation(orderNumber, checkoutToken)

  const [transferSent, setTransferSent] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)

  const verifyMutation = checkoutToken ? tokenVerifyMutation : authVerifyMutation
  const isVerifying = verifyMutation.isPending

  const orderStatus = verifyResult?.orderStatus ?? order.status
  const paymentStatus = verifyResult?.paymentStatus ?? order.paymentStatus
  const localPaymentActions: AccountOrderPaymentActions = verifyResult
    ? {
        canVerifyPayment: !isPaidStatus(verifyResult.orderStatus, verifyResult.paymentStatus),
        canRetryPayment: verifyResult.canRetryPayment,
        canContinuePayment: verifyResult.canContinuePayment,
        paymentRedirectUrl: verifyResult.paymentRedirectUrl,
      }
    : paymentActions

  const isPaid = isPaidStatus(orderStatus, paymentStatus)
  const elapsedMs = usePaymentConfirmationElapsed(open && !isPaid, startedAt)

  const confirmationState = resolvePaymentConfirmationUxState({
    orderStatus,
    paymentStatus,
    hasOrderData: true,
    elapsedMs,
  })

  const confirmationActions = getPaymentConfirmationActions(confirmationState, {
    canRetryPayment: localPaymentActions.canRetryPayment,
  })

  const modalCopy = getModalCopy(confirmationState)
  const stateTestId = getStateTestId(confirmationState)
  const tone = getOrderStatusTone(orderStatus)
  const hasCustomization = orderHasCustomization(order)

  const postCheckoutCallback = postCheckoutOrderDetail(orderNumber, checkoutToken)
  const loginUrl = login({ callbackUrl: postCheckoutCallback })
  const registerUrl = register({ callbackUrl: postCheckoutCallback })
  const verifyEmailUrl = verifyEmail({ callbackUrl: postCheckoutCallback })
  const contactSupportUrl = `${routes.contact}?order=${encodeURIComponent(orderNumber)}`
  const displayOrderEmail =
    maskedCustomerEmail ??
    (order.customerEmail ? maskEmail(order.customerEmail) : undefined)

  const handleLoginWithOrderEmail = useCallback(async () => {
    await signOut()
    router.push(login({ callbackUrl: postCheckoutCallback }))
    router.refresh()
  }, [postCheckoutCallback, router])

  const canDismiss =
    !isGuest &&
    (orderLinkedToAccount ||
      claimStatus === 'EMAIL_MISMATCH' ||
      claimStatus === 'EMAIL_VERIFICATION_REQUIRED' ||
      isPaid ||
      confirmationState === 'pendingAfterTimeout' ||
      confirmationState === 'failed')

  const applyVerifyResult = useCallback(
    (result: AccountPaymentStatusPayload) => {
      setVerifyResult(result)
      setVerifyMessage(result.message)
      onOrderUpdated?.(result)
    },
    [onOrderUpdated],
  )

  const runVerify = useCallback(() => {
    verifyMutation.mutate(undefined, {
      onSuccess: (result) => {
        applyVerifyResult(result)
      },
      onError: () => {
        setVerifyMessage('No pudimos verificar el pago. Intenta de nuevo.')
      },
    })
  }, [applyVerifyResult, verifyMutation])

  useEffect(() => {
    runVerifyLatestRef.current = runVerify
  }, [runVerify])

  useEffect(() => {
    if (!open || isPaid) {
      return
    }

    pollAttemptsRef.current = 0
    runVerifyLatestRef.current()

    const schedulePoll = () => {
      pollAttemptsRef.current += 1
      if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
        return
      }
      pollTimeoutRef.current = window.setTimeout(() => {
        runVerifyLatestRef.current()
        schedulePoll()
      }, POLL_INTERVAL_MS)
    }

    pollTimeoutRef.current = window.setTimeout(schedulePoll, POLL_INTERVAL_MS)

    return () => {
      if (pollTimeoutRef.current !== undefined) {
        window.clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [open, isPaid])

  const showProgress =
    (confirmationState === 'loading' || confirmationState === 'confirming') &&
    !isPaid
  const progressValue = Math.min(
    100,
    Math.round((elapsedMs / CHECKOUT_CONFIRMATION_VISUAL_MS) * 100),
  )

  const showManualVerify =
    confirmationActions.showVerifyAgain && localPaymentActions.canVerifyPayment && !isPaid

  const showRetry =
    (confirmationState === 'failed' ||
      confirmationState === 'expired' ||
      confirmationState === 'cancelled' ||
      confirmationState === 'pendingAfterTimeout') &&
    localPaymentActions.canRetryPayment &&
    checkoutToken.length > 0

  const guestAccountBlock = isGuest ? (
    <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="font-sans text-sm font-semibold text-foreground">
              Crea tu cuenta para consultar y dar seguimiento a tu pedido
            </p>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              Para guardar esta compra en tu cuenta y recibir actualizaciones, regístrate o
              inicia sesión. Después volverás a este pedido automáticamente.
            </p>
            {maskedCustomerEmail && (
              <p className="mt-2 font-serif text-xs text-muted-foreground">
                Compra realizada con {maskedCustomerEmail}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="font-sans" data-testid="post-checkout-create-account-button">
              <Link href={registerUrl}>Crear cuenta</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-sans"
              data-testid="post-checkout-login-button"
            >
              <Link href={loginUrl}>Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null

  const claimStatusBlock = (() => {
    if (isClaimingOrder) {
      return (
        <div
          data-testid="post-checkout-claiming-order"
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-4"
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
          <p className="font-serif text-sm text-muted-foreground">
            Estamos guardando este pedido en tu cuenta…
          </p>
        </div>
      )
    }

    if (
      orderLinkedToAccount &&
      (claimStatus === 'CLAIMED' || claimStatus === 'ALREADY_CLAIMED_BY_USER')
    ) {
      return (
        <div
          data-testid="post-checkout-claim-success"
          className="rounded-lg border border-success/30 bg-success/10 p-4"
        >
          <p className="font-serif text-sm text-success">
            {claimMessage ?? 'Pedido guardado en tu cuenta. Ya puedes consultarlo en Mis pedidos.'}
          </p>
        </div>
      )
    }

    if (claimStatus === 'EMAIL_MISMATCH') {
      const handleRequestTransfer = () => {
        setTransferError(null)
        transferMutation.mutate(undefined, {
          onSuccess: (result) => {
            if (
              result.success &&
              (result.status === 'SENT' || result.status === 'ALREADY_PENDING')
            ) {
              setTransferSent(true)
              return
            }

            setTransferError(
              result.message ?? 'No pudimos enviar la solicitud de autorización.',
            )
          },
          onError: () => {
            setTransferError('No pudimos enviar la solicitud de autorización. Intenta de nuevo.')
          },
        })
      }

      return (
        <div
          data-testid="post-checkout-email-mismatch"
          className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <div>
            <p className="font-sans text-sm font-semibold text-foreground">
              Esta compra fue realizada con otro correo.
            </p>
            <p className="mt-2 font-serif text-sm text-muted-foreground">
              Por seguridad no podemos guardar este pedido automáticamente en esta cuenta.
            </p>
          </div>

          <dl className="space-y-2 rounded-md border border-border/60 bg-background/60 p-3">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
              <dt className="font-serif text-xs text-muted-foreground">Correo de la compra</dt>
              <dd
                data-testid="post-checkout-order-email"
                className="font-sans text-sm font-medium text-foreground"
              >
                {displayOrderEmail ?? 'No disponible'}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
              <dt className="font-serif text-xs text-muted-foreground">Correo de tu sesión</dt>
              <dd
                data-testid="post-checkout-session-email"
                className="font-sans text-sm font-medium text-foreground"
              >
                {maskedSessionEmail ?? 'No disponible'}
              </dd>
            </div>
          </dl>

          <p className="font-serif text-xs leading-relaxed text-muted-foreground">
            Tu pedido sigue disponible en esta página mientras el enlace de compra sea válido.
            No aparecerá en Mis pedidos con la cuenta actual.
          </p>

          {transferSent ? (
            <div
              data-testid="post-checkout-transfer-request-sent"
              className="rounded-md border border-success/30 bg-success/10 p-3"
            >
              <p className="font-serif text-sm text-success">
                Enviamos un correo de autorización al correo usado en la compra.
              </p>
            </div>
          ) : null}

          {transferError ? (
            <div
              data-testid="post-checkout-transfer-request-error"
              className="rounded-md border border-destructive/30 bg-destructive/10 p-3"
            >
              <p className="font-serif text-sm text-destructive">{transferError}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 pt-1">
            {!transferSent && (
              <Button
                type="button"
                className="font-sans"
                data-testid="post-checkout-request-transfer-button"
                disabled={transferMutation.isPending}
                onClick={handleRequestTransfer}
              >
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Enviando…
                  </>
                ) : (
                  'Enviar autorización al correo de la compra'
                )}
              </Button>
            )}
            <Button
              type="button"
              variant={transferSent ? 'default' : 'outline'}
              className="font-sans"
              data-testid="post-checkout-login-with-order-email-button"
              onClick={() => {
                void handleLoginWithOrderEmail()
              }}
            >
              Iniciar sesión con el correo de la compra
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-sans"
              data-testid="post-checkout-contact-support-button"
            >
              <Link href={contactSupportUrl}>Contactar soporte</Link>
            </Button>
            {!isGuest && (
              <Button
                type="button"
                variant="ghost"
                className="font-sans"
                onClick={() => onOpenChange?.(false)}
              >
                Entendido
              </Button>
            )}
          </div>
        </div>
      )
    }

    if (claimStatus === 'EMAIL_VERIFICATION_REQUIRED') {
      return (
        <div
          data-testid="post-checkout-email-verification-required"
          className="mt-4 space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
        >
          <p className="font-serif text-sm text-muted-foreground">
            {claimMessage ??
              'Verifica tu correo para guardar este pedido en tu cuenta.'}
          </p>
          <Button asChild variant="secondary" className="font-sans">
            <Link href={verifyEmailUrl}>Verificar correo</Link>
          </Button>
        </div>
      )
    }

    if (
      claimStatus === 'TOKEN_INVALID' ||
      claimStatus === 'TOKEN_EXPIRED' ||
      claimStatus === 'ORDER_ALREADY_CLAIMED'
    ) {
      return (
        <div
          data-testid="post-checkout-claim-error"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
        >
          <p className="font-serif text-sm text-destructive">
            {claimMessage ?? 'No pudimos guardar este pedido en tu cuenta.'}
          </p>
        </div>
      )
    }

    return null
  })()

  return (
    <Dialog open={open} onOpenChange={canDismiss ? onOpenChange : undefined}>
      <DialogContent
        data-testid="post-checkout-order-modal"
        showCloseButton={canDismiss}
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        onPointerDownOutside={(event) => {
          if (!canDismiss) {
            event.preventDefault()
          }
        }}
        onEscapeKeyDown={(event) => {
          if (!canDismiss) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('font-sans text-xs', getOrderStatusBadgeClass(tone))}
            >
              {getOrderStatusLabel(orderStatus)}
            </Badge>
            <Badge variant="secondary" className="font-sans text-xs">
              Pago: {getPaymentStatusLabel(paymentStatus)}
            </Badge>
            {hasCustomization && (
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/5 font-sans text-xs text-primary"
              >
                <Sparkles className="h-3 w-3" aria-hidden />
                Con personalización
              </Badge>
            )}
            {isVerifying && (
              <Badge variant="outline" className="gap-1 font-sans text-xs">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Verificando
              </Badge>
            )}
          </div>

          <DialogTitle className="font-sans text-xl">{modalCopy.title}</DialogTitle>
          <DialogDescription className="font-serif text-sm leading-relaxed">
            {modalCopy.description}
          </DialogDescription>
        </DialogHeader>

        <div data-testid={stateTestId} className="space-y-4">
          <p className="font-serif text-sm text-muted-foreground">
            Pedido <span className="font-sans font-semibold text-foreground">{orderNumber}</span>
          </p>

          {showProgress && (
            <div className="space-y-2">
              <Progress value={progressValue} className="h-1.5" />
              <p className="font-serif text-xs text-muted-foreground">
                No cierres esta ventana mientras confirmamos el estado del pago.
              </p>
            </div>
          )}

          {verifyMessage && (
            <p
              className={cn(
                'font-serif text-sm',
                isPaid ? 'text-success' : 'text-muted-foreground',
              )}
              role="status"
            >
              {verifyMessage}
            </p>
          )}

          {showManualVerify && (
            <Button
              type="button"
              variant="secondary"
              className="font-sans"
              disabled={isVerifying}
              onClick={runVerify}
              data-testid="post-checkout-verify-payment-button"
            >
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {isVerifying ? 'Verificando…' : 'Verificar pago'}
            </Button>
          )}

          {showRetry && (
            <div data-testid="post-checkout-retry-payment-button">
              <CheckoutConektaPay
                returnToken={checkoutToken}
                orderNumber={orderNumber}
                autoRedirect={false}
              />
            </div>
          )}

          {guestAccountBlock}
          {claimStatusBlock}
        </div>

        {canDismiss && (isPaid || orderLinkedToAccount) && (
          <DialogFooter>
            <Button
              type="button"
              className="font-sans"
              onClick={() => onOpenChange?.(false)}
            >
              Ver detalle del pedido
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}