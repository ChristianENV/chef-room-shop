'use client'

import { useMemo } from 'react'

import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { EmailVerificationBanner } from '@/src/features/storefront/account/components/email-verification-banner'
import { ProfileSummary } from '@/src/features/storefront/account/profile-summary'
import { AccountQueryError } from '@/src/features/storefront/account/components/account-query-error'
import { useAccountAuthRedirect } from '@/src/features/storefront/account/api/use-account-auth-redirect'
import { getAccountUserErrorMessage } from '@/src/features/storefront/account/api/account-errors'
import { useAccountSummaryQuery } from '@/src/features/storefront/account/api/use-account-summary-query'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import {
  mapAccountAddressToUi,
  mapAccountDesignToUi,
  mapAccountUserToProfile,
  mapSummaryOrderToUi,
} from '@/src/features/storefront/account/mappers/account-ui.mapper'

export default function AccountPage() {
  const profileQuery = useMeProfileQuery()
  const summaryQuery = useAccountSummaryQuery()

  const isLoading = profileQuery.isLoading || summaryQuery.isLoading
  const isError = profileQuery.isError || summaryQuery.isError
  const error = profileQuery.error ?? summaryQuery.error

  useAccountAuthRedirect(isError, error)

  const user = useMemo(
    () => (profileQuery.data ? mapAccountUserToProfile(profileQuery.data) : null),
    [profileQuery.data],
  )

  const defaultAddress = useMemo(() => {
    const addr = summaryQuery.data?.defaultShippingAddress
    return addr ? mapAccountAddressToUi(addr) : undefined
  }, [summaryQuery.data])

  const recentOrders = useMemo(
    () => summaryQuery.data?.recentOrders.map(mapSummaryOrderToUi) ?? [],
    [summaryQuery.data],
  )

  const savedDesigns = useMemo(
    () => summaryQuery.data?.recentDesigns.map(mapAccountDesignToUi) ?? [],
    [summaryQuery.data],
  )

  const userName = user?.firstName ?? 'Cliente'

  if (isLoading) {
    return (
      <AccountLayout
        title="Mi Perfil"
        description="Resumen de tu cuenta"
        userName={userName}
      >
        <ProfileSummarySkeleton />
      </AccountLayout>
    )
  }

  if (isError || !user) {
    return (
      <AccountLayout
        title="Mi Perfil"
        description="Resumen de tu cuenta"
        userName={userName}
      >
        <AccountQueryError
          message={getAccountUserErrorMessage(
            error,
            'No pudimos cargar tu cuenta. Intenta de nuevo.',
          )}
          onRetry={() => {
            void profileQuery.refetch()
            void summaryQuery.refetch()
          }}
        />
      </AccountLayout>
    )
  }

  return (
    <AccountLayout
      title="Mi Perfil"
      description="Resumen de tu cuenta"
      userName={userName}
    >
      <EmailVerificationBanner />
      <ProfileSummary
        user={user}
        defaultAddress={defaultAddress}
        recentOrders={recentOrders}
        savedDesigns={savedDesigns}
      />
    </AccountLayout>
  )
}

function ProfileSummarySkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/3 rounded bg-secondary" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-secondary" />
              <div className="h-4 w-2/3 rounded bg-secondary" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
