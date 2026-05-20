'use client'

import { useMemo } from 'react'

import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { SavedDesignsGrid } from '@/src/features/storefront/account/saved-designs'
import { AccountQueryError } from '@/src/features/storefront/account/components/account-query-error'
import { useAccountAuthRedirect } from '@/src/features/storefront/account/api/use-account-auth-redirect'
import { getAccountUserErrorMessage } from '@/src/features/storefront/account/api/account-errors'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import { useMyDesignsQuery } from '@/src/features/storefront/account/api/use-my-designs-query'
import {
  mapAccountDesignToUi,
  mapAccountUserToProfile,
} from '@/src/features/storefront/account/mappers/account-ui.mapper'

export default function SavedDesignsPage() {
  const profileQuery = useMeProfileQuery()
  const designsQuery = useMyDesignsQuery()

  const isError = profileQuery.isError || designsQuery.isError
  const error = profileQuery.error ?? designsQuery.error

  useAccountAuthRedirect(isError, error)

  const userName = useMemo(() => {
    if (profileQuery.data) {
      return mapAccountUserToProfile(profileQuery.data).firstName
    }
    return 'Cliente'
  }, [profileQuery.data])

  const designs = useMemo(
    () => (designsQuery.data ?? []).map(mapAccountDesignToUi),
    [designsQuery.data],
  )

  const handleAddToCart = async (id: string) => {
    console.log('Add to cart (pendiente integración carrito):', id)
  }

  const handleDuplicate = async (id: string) => {
    console.log('Duplicate (sin mutation BFF):', id)
  }

  const handleDelete = async (id: string) => {
    console.log('Delete (sin mutation BFF):', id)
  }

  if (designsQuery.isError) {
    return (
      <AccountLayout
        title="Diseños Guardados"
        description="Tus personalizaciones guardadas"
        userName={userName}
      >
        <AccountQueryError
          message={getAccountUserErrorMessage(
            error,
            'No pudimos cargar tus diseños. Intenta de nuevo.',
          )}
          onRetry={() => void designsQuery.refetch()}
        />
      </AccountLayout>
    )
  }

  return (
    <AccountLayout
      title="Diseños Guardados"
      description="Tus personalizaciones guardadas"
      userName={userName}
    >
      <SavedDesignsGrid
        designs={designs}
        isLoading={designsQuery.isLoading}
        onAddToCart={handleAddToCart}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </AccountLayout>
  )
}
