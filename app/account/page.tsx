'use client'

import { useEffect, useState } from 'react'
import { AccountLayout } from '@/components/layout/account-layout'
import { ProfileSummary } from '@/components/account/profile-summary'
import { 
  MOCK_USER, 
  MOCK_ADDRESSES, 
  MOCK_ORDERS, 
  MOCK_SAVED_DESIGNS,
} from '@/lib/mock-data'
import type { UserProfile, Address, Order, SavedDesign } from '@/lib/types'

// TODO: Replace with TanStack Query useQuery hooks
// import { useQuery } from '@tanstack/react-query'
// import { fetchUserProfile, fetchUserAddresses, fetchUserOrders, fetchSavedDesigns } from '@/lib/api'

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      setUser(MOCK_USER)
      setAddresses(MOCK_ADDRESSES)
      setOrders(MOCK_ORDERS)
      setDesigns(MOCK_SAVED_DESIGNS)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const defaultAddress = addresses.find(a => a.isDefaultShipping)

  if (isLoading) {
    return (
      <AccountLayout 
        title="Mi Perfil" 
        description="Resumen de tu cuenta"
        userName={MOCK_USER.firstName}
      >
        <ProfileSummarySkeleton />
      </AccountLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AccountLayout 
      title="Mi Perfil" 
      description="Resumen de tu cuenta"
      userName={user.firstName}
    >
      <ProfileSummary
        user={user}
        defaultAddress={defaultAddress}
        recentOrders={orders}
        savedDesigns={designs}
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
