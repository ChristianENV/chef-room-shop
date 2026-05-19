'use client'

import { useEffect, useState } from 'react'
import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { SavedDesignsGrid } from '@/src/features/storefront/account/saved-designs'
import { MOCK_USER, MOCK_SAVED_DESIGNS } from '@/lib/mock-data'
import type { SavedDesign } from '@/lib/types'

// TODO: Replace with TanStack Query useQuery hooks
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { fetchSavedDesigns, addDesignToCart, duplicateDesign, deleteDesign } from '@/lib/api'

export default function SavedDesignsPage() {
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      setDesigns(MOCK_SAVED_DESIGNS)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleAddToCart = async (id: string) => {
    // TODO: Implement with TanStack Query mutation
    console.log('Add to cart:', id)
    // Update local state optimistically
    setDesigns(prev => 
      prev.map(d => d.id === id ? { ...d, status: 'en-carrito' as const } : d)
    )
  }

  const handleDuplicate = async (id: string) => {
    // TODO: Implement with TanStack Query mutation
    console.log('Duplicate:', id)
    const original = designs.find(d => d.id === id)
    if (original) {
      const duplicate: SavedDesign = {
        ...original,
        id: `design-${Date.now()}`,
        name: `${original.name} (copia)`,
        status: 'borrador',
        lastEdited: new Date().toISOString().split('T')[0],
      }
      setDesigns(prev => [duplicate, ...prev])
    }
  }

  const handleDelete = async (id: string) => {
    // TODO: Implement with TanStack Query mutation
    console.log('Delete:', id)
    setDesigns(prev => prev.filter(d => d.id !== id))
  }

  return (
    <AccountLayout 
      title="Diseños Guardados" 
      description="Tus personalizaciones guardadas"
      userName={MOCK_USER.firstName}
    >
      <SavedDesignsGrid 
        designs={designs} 
        isLoading={isLoading}
        onAddToCart={handleAddToCart}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </AccountLayout>
  )
}
