'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'

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
import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { routes } from '@/src/config/routes'

export default function AccountOrderDetailPage() {
  const params = useParams()
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : ''

  const profileQuery = useMeProfileQuery()
  const orderQuery = useMyOrderByNumberQuery({ orderNumber })

  const callbackUrl = orderNumber
    ? routes.accountOrderDetail(orderNumber)
    : `${routes.account}/orders`

  const authError = profileQuery.error ?? orderQuery.error
  const isAuthError = profileQuery.isError || orderQuery.isError
  useAccountAuthRedirect(isAuthError, authError)

  const userName = useMemo(() => {
    if (profileQuery.data) {
      return mapAccountUserToProfile(profileQuery.data).firstName
    }
    return 'Cliente'
  }, [profileQuery.data])

  const emailNotVerified = orderQuery.isError && isEmailNotVerifiedError(orderQuery.error)

  if (orderQuery.isLoading || profileQuery.isLoading) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <OrderDetailSkeleton />
      </AccountLayout>
    )
  }

  if (emailNotVerified) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <EmailVerificationBanner />
        <OrderDetailEmailVerification callbackUrl={callbackUrl} />
      </AccountLayout>
    )
  }

  if (orderQuery.isError) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <OrderDetailError onRetry={() => void orderQuery.refetch()} />
      </AccountLayout>
    )
  }

  const order = orderQuery.data

  if (!order) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <OrderDetailEmpty />
      </AccountLayout>
    )
  }

  const normalizedOrder = {
    ...order,
    payments: order.payments ?? [],
    shipments: order.shipments ?? [],
    events: order.events ?? [],
    subtotalCents: order.subtotalCents ?? order.totalCents,
  }

  return (
    <AccountLayout
      title={`Pedido ${order.orderNumber}`}
      description="Estado, pagos y seguimiento"
      userName={userName}
    >
      <EmailVerificationBanner />
      <OrderDetailPageContent order={normalizedOrder} />
    </AccountLayout>
  )
}
