'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

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
import { useAddCartItemMutation } from '@/src/features/storefront/cart/api/use-add-cart-item-mutation'
import { extractSelectionFromConfigJson } from '@/src/lib/customization/build-customization-snapshot'
import { routes } from '@/src/config/routes'

export default function SavedDesignsPage() {
  const router = useRouter()
  const profileQuery = useMeProfileQuery()
  const designsQuery = useMyDesignsQuery()
  const addToCart = useAddCartItemMutation()
  const [addingDesignId, setAddingDesignId] = useState<string | null>(null)
  const [cartError, setCartError] = useState<string | null>(null)

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
    const design = designsQuery.data?.find((item) => item.id === id)
    if (!design?.product?.id) {
      setCartError('No pudimos identificar el producto de este diseño.')
      return
    }

    setCartError(null)
    setAddingDesignId(id)

    try {
      const selection = extractSelectionFromConfigJson(design.configJson)
      await addToCart.mutateAsync({
        productId: design.product.id,
        productVariantId: selection.selectedVariantId,
        designId: design.id,
        quantity: 1,
      })
      router.push(routes.cart)
    } catch {
      setCartError('No pudimos agregar este diseño al carrito.')
    } finally {
      setAddingDesignId(null)
    }
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
      {cartError ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {cartError}
        </div>
      ) : null}
      <SavedDesignsGrid
        designs={designs}
        isLoading={designsQuery.isLoading}
        onAddToCart={handleAddToCart}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        addingDesignId={addingDesignId}
      />
    </AccountLayout>
  )
}
