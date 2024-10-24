'use client'

import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { StallCard } from './stallcard'
import { Loader2 } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface CompletedOrder {
  stallName: string;
  orderNumbers: string[];
}

// APIから全ての屋台を取得する関数
const getAllStore = async (): Promise<string[]> => {
  const response = await fetch('/api/StoreData/getter/getAllStore')
  if (!response.ok) {
    throw new Error('Failed to fetch stores')
  }
  const data = await response.json()
  return data.map((store: { storeName: string }) => store.storeName)
}

// APIから屋台ごとの注文番号を取得する関数
const getCookTrueAndGetFalse = async (stallName: string): Promise<string[]> => {
  const response = await fetch(`/api/StoreOrder/getter/getCookTrueAndGetFalse?storeName=${stallName}`)
  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }
  const data = await response.json()
  return data.map((order: { ticketNumber: string }) => order.ticketNumber)
}

export default function CompletedOrders() {
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([])

  const { data: stalls, isLoading: isLoadingStalls, error: stallsError } = useQuery('stalls', getAllStore)

  const { data: orders, isLoading: isLoadingOrders, error: ordersError, refetch } = useQuery(
    ['orders', stalls],
    async () => {
      if (!stalls) return []
      const orders = await Promise.all(
        stalls.map(async (stall) => {
          const orderNumbers = await getCookTrueAndGetFalse(stall)
          return { stallName: stall, orderNumbers }
        })
      )
      return orders
    },
    {
      enabled: !!stalls,
      onSuccess: (data) => setCompletedOrders(data)
    }
  )

  useEffect(() => {
    const eventSource = new EventSource('/api/StoreOrder/getter/cookAndgetStatusSurveillance')
    eventSource.onmessage = () => {
      refetch()
    }

    return () => {
      eventSource.close()
    }
  }, [refetch])

  if (isLoadingStalls || isLoadingOrders) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>
  }

  if (stallsError || ordersError) {
    return <div className="text-red-500 items-center">エラーが発生しました。再度お試しください。</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {completedOrders.map((order) => (
          <StallCard key={order.stallName} stallName={order.stallName} orderNumbers={order.orderNumbers} />
        ))}
      </div>
      <Toaster />
    </div>
  )
}