'use client'

import { useMemo } from 'react'

import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { AccountQueryError } from '@/src/features/storefront/account/components/account-query-error'
import { useAccountAuthRedirect } from '@/src/features/storefront/account/api/use-account-auth-redirect'
import { getAccountUserErrorMessage } from '@/src/features/storefront/account/api/account-errors'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import { mapAccountUserToProfile } from '@/src/features/storefront/account/mappers/account-ui.mapper'
import { NotificationsPageContent } from '@/src/features/notifications/components/notifications-page-content'
import { useMyNotificationsQuery } from '@/src/features/notifications/api/use-my-notifications-query'

export default function NotificationsPage() {
  const profileQuery = useMeProfileQuery()
  const notificationsQuery = useMyNotificationsQuery({ first: 50 })

  const isError = profileQuery.isError || notificationsQuery.isError
  const error = profileQuery.error ?? notificationsQuery.error

  useAccountAuthRedirect(isError, error)

  const userName = useMemo(() => {
    if (profileQuery.data) {
      return mapAccountUserToProfile(profileQuery.data).firstName
    }
    return 'Cliente'
  }, [profileQuery.data])

  if (notificationsQuery.isError) {
    return (
      <AccountLayout
        title="Notificaciones"
        description="Avisos de pedidos, pagos y diseños"
        userName={userName}
      >
        <AccountQueryError
          message={getAccountUserErrorMessage(
            error,
            'No pudimos cargar tus notificaciones. Intenta de nuevo.',
          )}
          onRetry={() => void notificationsQuery.refetch()}
        />
      </AccountLayout>
    )
  }

  return (
    <AccountLayout
      title="Notificaciones"
      description="Avisos de pedidos, pagos y diseños"
      userName={userName}
    >
      <NotificationsPageContent />
    </AccountLayout>
  )
}
