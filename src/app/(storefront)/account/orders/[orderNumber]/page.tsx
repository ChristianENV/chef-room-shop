'use client'

import { Suspense, useCallback, useMemo, useState } from 'react'
import { useParams, usePathname, useSearchParams } from 'next/navigation'

import { EmailVerificationBanner } from '@/src/features/storefront/account/components/email-verification-banner'
import { useAccountAuthRedirect } from '@/src/features/storefront/account/api/use-account-auth-redirect'
import { isEmailNotVerifiedError } from '@/src/features/storefront/account/api/account-errors'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import { useMyOrderByNumberQuery } from '@/src/features/storefront/account/api/use-my-order-by-number-query'
import {
  OrderDetailEmailVerification,
  OrderDetailEmpty,
  OrderDetailError,
  OrderDetailPageContent,
  OrderDetailSkeleton,
} from '@/src/features/storefront/account/order-detail'
import { mapAccountUserToProfile } from '@/src/features/storefront/account/mappers/account-ui.mapper'
import type { AccountOrder } from '@/src/features/storefront/account/types'
import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { useOrderByCheckoutTokenQuery } from '@/src/features/storefront/checkout'
import { PostCheckoutOrderModal } from '@/src/features/storefront/orders/components/post-checkout-order-modal'
import { usePostCheckoutGuestOrderClaim } from '@/src/features/storefront/orders/hooks/use-post-checkout-guest-order-claim'
import { useSession } from '@/src/lib/auth/auth-client'
import { routes } from '@/src/config/routes'

function AccountOrderDetailPageContent() {
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : ''
  const fromCheckout = searchParams.get('from') === 'checkout'
  const checkoutToken = searchParams.get('token')?.trim() ?? ''
  const hasCheckoutTokenAccess = fromCheckout && checkoutToken.length > 0

  const callbackUrl = useMemo(() => {
    const query = searchParams.toString()
    if (query) {
      return `${pathname}?${query}`
    }
    return orderNumber ? routes.accountOrderDetail(orderNumber) : `${routes.account}/orders`
  }, [orderNumber, pathname, searchParams])

  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)
  const isGuest = !isAuthenticated
  const emailVerified = Boolean(session?.user?.emailVerified)

  const profileQuery = useMeProfileQuery({ enabled: isAuthenticated })
  const tokenOrderQuery = useOrderByCheckoutTokenQuery({
    orderNumber,
    token: checkoutToken,
    enabled: hasCheckoutTokenAccess,
  })
  const authOrderQuery = useMyOrderByNumberQuery({
    orderNumber,
    enabled: !hasCheckoutTokenAccess && isAuthenticated,
  })

  const authError = profileQuery.error ?? authOrderQuery.error
  const isAuthError = profileQuery.isError || authOrderQuery.isError
  useAccountAuthRedirect(isAuthError, authError, {
    enabled: !hasCheckoutTokenAccess,
    callbackUrl,
  })

  const [postCheckoutModalOpen, setPostCheckoutModalOpen] = useState(fromCheckout)

  const refetchAfterClaim = useCallback(() => {
    void tokenOrderQuery.refetch()
  }, [tokenOrderQuery])

  const postCheckoutClaim = usePostCheckoutGuestOrderClaim({
    orderNumber,
    checkoutToken,
    enabled: isAuthenticated && hasCheckoutTokenAccess,
    emailVerified,
    onClaimSettled: refetchAfterClaim,
  })

  const userName = useMemo(() => {
    if (profileQuery.data) {
      return mapAccountUserToProfile(profileQuery.data).firstName
    }
    return 'Cliente'
  }, [profileQuery.data])

  const isLoading = hasCheckoutTokenAccess
    ? tokenOrderQuery.isLoading
    : authOrderQuery.isLoading || profileQuery.isLoading

  if (isLoading) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <OrderDetailSkeleton />
      </AccountLayout>
    )
  }

  if (hasCheckoutTokenAccess) {
    if (tokenOrderQuery.isError || !tokenOrderQuery.data?.order) {
      return (
        <AccountLayout title="Detalle del pedido" userName={userName}>
          <OrderDetailError onRetry={() => void tokenOrderQuery.refetch()} />
        </AccountLayout>
      )
    }

    const tokenAccess = tokenOrderQuery.data
    const order = normalizeOrder(tokenAccess.order)
    const isAuthenticatedOwner =
      postCheckoutClaim.orderLinkedToAccount ||
      (isAuthenticated && tokenAccess.viewerEmailMatchesOrder)

    return (
      <AccountLayout
        title={`Pedido ${order.orderNumber}`}
        description="Estado, pagos y seguimiento"
        userName={userName}
      >
        <div>
          <EmailVerificationBanner />
          <OrderDetailPageContent order={order} />
          <PostCheckoutOrderModal
            open={postCheckoutModalOpen}
            order={order}
            orderNumber={order.orderNumber}
            checkoutToken={checkoutToken}
            isGuest={isGuest}
            isAuthenticatedOwner={Boolean(isAuthenticatedOwner)}
            viewerEmailMatchesOrder={tokenAccess.viewerEmailMatchesOrder}
            maskedCustomerEmail={tokenAccess.maskedCustomerEmail}
            paymentActions={
              order.paymentActions ?? {
                canVerifyPayment: true,
                canContinuePayment: false,
                canRetryPayment: false,
                paymentRedirectUrl: null,
              }
            }
            onOpenChange={setPostCheckoutModalOpen}
            onOrderUpdated={() => {
              void tokenOrderQuery.refetch()
            }}
            claimStatus={postCheckoutClaim.claimStatus}
            isClaimingOrder={postCheckoutClaim.isClaimingOrder}
            claimMessage={postCheckoutClaim.claimMessage}
            orderLinkedToAccount={postCheckoutClaim.orderLinkedToAccount}
          />
        </div>
      </AccountLayout>
    )
  }

  const emailNotVerified = authOrderQuery.isError && isEmailNotVerifiedError(authOrderQuery.error)

  if (emailNotVerified) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <EmailVerificationBanner />
        <OrderDetailEmailVerification callbackUrl={callbackUrl} />
      </AccountLayout>
    )
  }

  if (authOrderQuery.isError) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <OrderDetailError onRetry={() => void authOrderQuery.refetch()} />
      </AccountLayout>
    )
  }

  const order = authOrderQuery.data

  if (!order) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <OrderDetailEmpty />
      </AccountLayout>
    )
  }

  const normalizedOrder = normalizeOrder(order)

  return (
    <AccountLayout
      title={`Pedido ${order.orderNumber}`}
      description="Estado, pagos y seguimiento"
      userName={userName}
    >
      <div>
        <EmailVerificationBanner />
        <OrderDetailPageContent order={normalizedOrder} />
        {fromCheckout && checkoutToken && (
          <PostCheckoutOrderModal
            open={postCheckoutModalOpen}
            order={normalizedOrder}
            orderNumber={normalizedOrder.orderNumber}
            checkoutToken={checkoutToken}
            isGuest={isGuest}
            isAuthenticatedOwner
            viewerEmailMatchesOrder
            paymentActions={
              normalizedOrder.paymentActions ?? {
                canVerifyPayment: true,
                canContinuePayment: false,
                canRetryPayment: false,
                paymentRedirectUrl: null,
              }
            }
            onOpenChange={setPostCheckoutModalOpen}
            onOrderUpdated={() => {
              void authOrderQuery.refetch()
            }}
            orderLinkedToAccount
          />
        )}
      </div>
    </AccountLayout>
  )
}

function normalizeOrder(order: AccountOrder): AccountOrder {
  return {
    ...order,
    payments: order.payments ?? [],
    shipments: order.shipments ?? [],
    events: order.events ?? [],
    subtotalCents: order.subtotalCents ?? order.totalCents,
  }
}

export default function AccountOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <AccountLayout title="Detalle del pedido" userName="Cliente">
          <OrderDetailSkeleton />
        </AccountLayout>
      }
    >
      <AccountOrderDetailPageContent />
    </Suspense>
  )
}
