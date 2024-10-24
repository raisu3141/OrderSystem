'use client'

import { useState, useEffect } from 'react'
import { StallCard } from './stallcard'

interface CompletedOrder {
  stallName: string;
  orderNumbers: string[];
}

export default function CompletedOrders() {
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([])

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const stalls = await getAllStore()
        const orders = await Promise.all(
          stalls.map(async (stall) => {
            const orderNumbers = await getCookTrueAndGetFalse(stall)
            return { stallName: stall, orderNumbers }
          })
        )
        setCompletedOrders(orders)
      } catch (error) {
        console.error('Error fetching completed orders:', error)
      }
    }

    fetchCompletedOrders()

    const eventSource = new EventSource('/api/cookAndgetStatusSurveillance')
    eventSource.onmessage = () => {
      fetchCompletedOrders()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">お呼び出し中の注文番号</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {completedOrders.map((order) => (
          <StallCard key={order.stallName} stallName={order.stallName} orderNumbers={order.orderNumbers} />
        ))}
      </div>
    </div>
  )
}

// Mock API functions (replace these with actual API calls)
async function getAllStore(): Promise<string[]> {
  // Simulating API call
  return ['屋台1', '屋台2', '屋台3', '屋台4']
}

async function getCookTrueAndGetFalse(stallName: string): Promise<string[]> {
  // Simulating API call
  return ['22', '23', '25', '26'].slice(0, Math.floor(Math.random() * 5))
}