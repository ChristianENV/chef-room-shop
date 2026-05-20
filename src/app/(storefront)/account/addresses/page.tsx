'use client'

import { useMemo, useState } from 'react'

import type { Address } from '@/lib/types'
import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { AddressesList, AddressDialog } from '@/src/features/storefront/account/addresses'
import { AccountQueryError } from '@/src/features/storefront/account/components/account-query-error'
import { useAccountAuthRedirect } from '@/src/features/storefront/account/api/use-account-auth-redirect'
import { getAccountUserErrorMessage } from '@/src/features/storefront/account/api/account-errors'
import { useCreateMyAddressMutation } from '@/src/features/storefront/account/api/use-create-my-address-mutation'
import { useDeleteMyAddressMutation } from '@/src/features/storefront/account/api/use-delete-my-address-mutation'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import { useMyAddressesQuery } from '@/src/features/storefront/account/api/use-my-addresses-query'
import { useSetDefaultAddressMutation } from '@/src/features/storefront/account/api/use-set-default-address-mutation'
import { useUpdateMyAddressMutation } from '@/src/features/storefront/account/api/use-update-my-address-mutation'
import {
  mapAccountAddressToUi,
  mapAccountUserToProfile,
  mapUiAddressToInput,
  mapUiDefaultTypeToBff,
  type UiAddress,
} from '@/src/features/storefront/account/mappers/account-ui.mapper'

export default function AddressesPage() {
  const profileQuery = useMeProfileQuery()
  const addressesQuery = useMyAddressesQuery()
  const createMutation = useCreateMyAddressMutation()
  const updateMutation = useUpdateMyAddressMutation()
  const deleteMutation = useDeleteMyAddressMutation()
  const setDefaultMutation = useSetDefaultAddressMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UiAddress | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const isError = profileQuery.isError || addressesQuery.isError
  const error = profileQuery.error ?? addressesQuery.error

  useAccountAuthRedirect(isError, error)

  const userName = useMemo(() => {
    if (profileQuery.data) {
      return mapAccountUserToProfile(profileQuery.data).firstName
    }
    return 'Cliente'
  }, [profileQuery.data])

  const addresses = useMemo(
    () => (addressesQuery.data ?? []).map(mapAccountAddressToUi),
    [addressesQuery.data],
  )

  const handleAddAddress = () => {
    setMutationError(null)
    setEditingAddress(null)
    setDialogOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setMutationError(null)
    setEditingAddress(address as UiAddress)
    setDialogOpen(true)
  }

  const handleSaveAddress = async (addressData: Partial<Address>) => {
    setMutationError(null)
    try {
      const input = mapUiAddressToInput(addressData)
      if (editingAddress) {
        await updateMutation.mutateAsync({ id: editingAddress.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }
      setDialogOpen(false)
      setEditingAddress(null)
    } catch {
      setMutationError('No pudimos guardar la dirección. Revisa los datos e intenta de nuevo.')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    setMutationError(null)
    try {
      await deleteMutation.mutateAsync(id)
    } catch {
      setMutationError('No pudimos eliminar la dirección. Intenta de nuevo.')
    }
  }

  const handleSetDefault = async (id: string, type: 'shipping' | 'billing') => {
    setMutationError(null)
    try {
      await setDefaultMutation.mutateAsync({
        id,
        type: mapUiDefaultTypeToBff(type),
      })
    } catch {
      setMutationError('No pudimos actualizar la dirección predeterminada.')
    }
  }

  if (addressesQuery.isError) {
    return (
      <AccountLayout
        title="Direcciones"
        description="Gestiona tus direcciones de envio"
        userName={userName}
      >
        <AccountQueryError
          message={getAccountUserErrorMessage(
            error,
            'No pudimos cargar tus direcciones. Intenta de nuevo.',
          )}
          onRetry={() => void addressesQuery.refetch()}
        />
      </AccountLayout>
    )
  }

  return (
    <AccountLayout
      title="Direcciones"
      description="Gestiona tus direcciones de envio"
      userName={userName}
    >
      {mutationError ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 font-serif text-sm text-destructive">
          {mutationError}
        </p>
      ) : null}

      <AddressesList
        addresses={addresses}
        isLoading={addressesQuery.isLoading}
        onAddAddress={handleAddAddress}
        onEditAddress={handleEditAddress}
        onDeleteAddress={handleDeleteAddress}
        onSetDefault={handleSetDefault}
      />

      <AddressDialog
        key={editingAddress?.id ?? 'new'}
        address={editingAddress}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveAddress}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </AccountLayout>
  )
}
