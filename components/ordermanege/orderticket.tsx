'use client'

import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/ticketcard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Loader2 } from 'lucide-react'



interface OrderList {
  productId: string;
  productName: string;
  orderQuantity: number;
}

interface Order {
  clientName: string;
  cookStatus: boolean;
  getStatus: boolean;
  orderId: string;
  orderList: OrderList[];
  ticketNumber: number;
}

// 屋台Id, 調理状況, 受け渡し状況を指定してあてはまる注文を取得
async function fetchOrders(storeName: string, status: 'preparing' | 'ready' | 'completed'): Promise<Order[]> { 
  const response = await fetch(`/api/StoreOrder/getter/getOrders?storeName=${storeName}`); 
  if (!response.ok) { 
    throw new Error('Failed to fetch orders'); 
  } 
  const data: Order[] = await response.json();

  // statusの値によってフィルタリング
  return data.filter(order => {
    switch (status) {
      case 'preparing':
        return order.cookStatus === false && order.getStatus === false;
      case 'ready':
        return order.cookStatus === true && order.getStatus === false;
      case 'completed':
        return order.cookStatus === true && order.getStatus === true;
      default:
        return false;
    }
  });
}

interface OrderticketProps {
  storeName: string;
}

export default function OrderTicket({ storeName }: OrderticketProps) {
  const [activeTab, setActiveTab] = useState<'preparing' | 'ready'>('preparing')

  // 調理待ちの注文を取得
  const { data: preparingOrders, isLoading: isLoadingPreparing, error: errorPreparing } = useQuery(
    ['orders', storeName, 'perparing'],
    () => fetchOrders(storeName, 'preparing'),
    { refetchInterval: 5000 } // 5秒ごとに再取得
  )

  // 受け渡し待ちの注文を取得
  const { data: readyOrders, isLoading: isLoadingReady, error: errorReady } = useQuery(
    ['orders', storeName, 'ready'],
    () => fetchOrders(storeName, 'ready'),
    { refetchInterval: 5000 } // 5秒ごとに再取得
  )

  // 注文のステータスを更新
  const updateOrderStatus = async (storeName: string, orderId: string, newStatus: 'ready' | 'completed') => {

    const cookStatus = newStatus === 'ready' ? true : false
    const getStatus = newStatus === 'completed' ? true : false
    await fetch(`/api/StoreOrder/update/PatchOrderStatus?storeName=${storeName}&orderId=${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookStatus, getStatus }),
    })
    await Promise.all([
      fetchOrders(storeName, 'preparing'),
      fetchOrders(storeName, 'ready'),
    ])
  }

  const renderOrderCard = (order: Order, status: 'preparing' | 'ready') => (
    <Card key={order.orderId} className="mb-4 bg-gray-100">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-20 mr-4">
            <div className="text-sm text-gray-500">整理券番号</div>
            <div className="text-4xl font-bold">{order.ticketNumber}</div>
          </div>
          <div className="flex-shrink-0 w-20 mr-4">
            <div className="text-sm mb-2">{order.clientName}</div>
          </div>
          <div className="flex-grow">
            <ul className="space-y-1">
              {order.orderList.map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span>{item.productName}</span>
                  <span>× {item.orderQuantity}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0 ml-4">
            <Button 
              onClick={() => updateOrderStatus(storeName, order.orderId, status === 'preparing' ? 'ready' : 'completed')}
              className="w-24 bg-gray-200 text-black hover:bg-gray-300"
            >
              {status === 'preparing' ? '調理完了' : '受け渡し完了'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoadingPreparing || isLoadingReady) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>
  }

  if (errorPreparing || errorReady) {
    return <div className="text-red-500">エラーが発生しました。再度お試しください。</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'preparing' | 'ready')}> 
        <TabsList className="grid w-full grid-cols-2 mb-4"> 
          <TabsTrigger  
            value="preparing"  
            className={`text-lg px-4 py-2 ${activeTab === 'preparing' ? 'border-b-2 border-orange-500' : ''}`}>
            調理待ち
          </TabsTrigger>  
          <TabsTrigger  
            value="ready"  
            className={`text-lg px-4 py-2 ${activeTab === 'ready' ? 'border-b-2 border-green-500' : ''}`}>
            受け渡し待ち
          </TabsTrigger>  
        </TabsList> 
        <TabsContent value="preparing"> 
          <div> 
            {preparingOrders?.map(order => renderOrderCard(order, 'preparing'))} 
          </div> 
        </TabsContent> 
        <TabsContent value="ready"> 
          <div> 
            {readyOrders?.map(order => renderOrderCard(order, 'ready'))} 
          </div> 
        </TabsContent> 
      </Tabs>

    </div>
  )
}