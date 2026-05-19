'use client'

import { useEffect, useState } from 'react'
import { AccountLayout } from '@/components/layout/account-layout'
import { AddressesList, AddressDialog } from '@/components/account/addresses'
import { MOCK_USER, MOCK_ADDRESSES } from '@/lib/mock-data'
import type { Address } from '@/lib/types'

// TODO: Replace with TanStack Query useQuery hooks
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { fetchUserAddresses, createAddress, updateAddress, deleteAddress } from '@/lib/api'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    // Simulate API fetch
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 400))
      setAddresses(MOCK_ADDRESSES)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleAddAddress = () => {
    setEditingAddress(null)
    setDialogOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setDialogOpen(true)
  }

  const handleSaveAddress = async (addressData: Partial<Address>) => {
    // TODO: Implement with TanStack Query mutation
    if (editingAddress) {
      // Update existing
      setAddresses(prev => 
        prev.map(a => a.id === editingAddress.id ? { ...a, ...addressData } as Address : a)
      )
    } else {
      // Create new
      const newAddress: Address = {
        ...addressData,
        id: `addr-${Date.now()}`,
        country: 'Mexico',
      } as Address
      setAddresses(prev => [...prev, newAddress])
    }
    setDialogOpen(false)
    setEditingAddress(null)
  }

  const handleDeleteAddress = async (id: string) => {
    // TODO: Implement with TanStack Query mutation
    console.log('Delete address:', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const handleSetDefault = async (id: string, type: 'shipping' | 'billing') => {
    // TODO: Implement with TanStack Query mutation
    console.log('Set default:', id, type)
    setAddresses(prev => 
      prev.map(a => ({
        ...a,
        isDefaultShipping: type === 'shipping' ? a.id === id : a.isDefaultShipping,
        isDefaultBilling: type === 'billing' ? a.id === id : a.isDefaultBilling,
      }))
    )
  }

  return (
    <AccountLayout 
      title="Direcciones" 
      description="Gestiona tus direcciones de envio"
      userName={MOCK_USER.firstName}
    >
      <AddressesList 
        addresses={addresses} 
        isLoading={isLoading}
        onAddAddress={handleAddAddress}
        onEditAddress={handleEditAddress}
        onDeleteAddress={handleDeleteAddress}
        onSetDefault={handleSetDefault}
      />

      <AddressDialog
        address={editingAddress}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveAddress}
      />
    </AccountLayout>
  )
}
