'use client'

import { useEffect, useState } from 'react'
import { AccountLayout } from '@/components/layout/account-layout'
import { OrdersList } from '@/components/account/orders-list'
import { MOCK_USER, MOCK_ORDERS } from '@/lib/mock-data'
import type { Order } from '@/lib/types'

// TODO: Replace with TanStack Query useQuery hooks
// import { useQuery } from '@tanstack/react-query'
// import { fetchUserOrders } from '@/lib/api'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 600))
      setOrders(MOCK_ORDERS)
      setIsLoading(false)
    }
    loadData()
  }, [])

  return (
    <AccountLayout 
      title="Mis Pedidos" 
      description="Historial y seguimiento de tus pedidos"
      userName={MOCK_USER.firstName}
    >
      <OrdersList orders={orders} isLoading={isLoading} />
    </AccountLayout>
  )
}
