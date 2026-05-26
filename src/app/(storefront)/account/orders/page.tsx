'use client'

import { useMemo } from 'react'

import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { OrdersList } from '@/src/features/storefront/account/orders-list'
import { AccountQueryError } from '@/src/features/storefront/account/components/account-query-error'
import { useAccountAuthRedirect } from '@/src/features/storefront/account/api/use-account-auth-redirect'
import { getAccountUserErrorMessage } from '@/src/features/storefront/account/api/account-errors'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import { useMyOrdersQuery } from '@/src/features/storefront/account/api/use-my-orders-query'
import { mapAccountUserToProfile } from '@/src/features/storefront/account/mappers/account-ui.mapper'

export default function OrdersPage() {
  const profileQuery = useMeProfileQuery()
  const ordersQuery = useMyOrdersQuery()

  const isError = profileQuery.isError || ordersQuery.isError
  const error = profileQuery.error ?? ordersQuery.error

  useAccountAuthRedirect(isError, error)

  const userName = useMemo(() => {
    if (profileQuery.data) {
      return mapAccountUserToProfile(profileQuery.data).firstName
    }
    return 'Cliente'
  }, [profileQuery.data])

  if (ordersQuery.isError) {
    return (
      <AccountLayout
        title="Mis Pedidos"
        description="Historial y seguimiento de tus pedidos"
        userName={userName}
      >
        <AccountQueryError
          message={getAccountUserErrorMessage(
            error,
            'No pudimos cargar tus pedidos. Intenta de nuevo.',
          )}
          onRetry={() => void ordersQuery.refetch()}
        />
      </AccountLayout>
    )
  }

  return (
    <AccountLayout
      title="Mis Pedidos"
      description="Historial y seguimiento de tus pedidos"
      userName={userName}
    >
      <OrdersList orders={ordersQuery.data ?? []} isLoading={ordersQuery.isLoading} />
    </AccountLayout>
  )
}
