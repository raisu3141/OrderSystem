'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/ticketcard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { AlertCircle, Loader2 } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast';

import styles from '../../components/ordermanege/orderticket.module.css'

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <Loader2 className="animate-spin text-white w-16 h-16" />
  </div>
)

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
  orderTime: string;
}

async function fetchOrders(storeName: string, status: 'preparing' | 'ready' | 'all'): Promise<Order[]> {
  const response = await fetch(`/api/StoreOrder/getter/getOrders?storeName=${storeName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const data: Order[] = await response.json();
  // コンソールに出力
  console.log(data);
  if (status === 'all') {
    return data
  } else {
    return data.filter(order => {
      switch (status) {
        case 'preparing':
          return order.cookStatus === false && order.getStatus === false;
        case 'ready':
          return order.cookStatus === true && order.getStatus === false;
        default:
          return false;
      }
    });
  }
}

interface OrderticketProps {
  storeName: string;
}

export default function OrderTicket({ storeName }: OrderticketProps) {
  const [activeTab, setActiveTab] = useState<'preparing' | 'ready' | 'all'>('preparing')
  const [showAllOrders, setShowAllOrders] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const queryClient = useQueryClient()

  const { data: allOrders, isLoading: isLoadingAll, error: errorAll } = useQuery(
    ['orders', storeName, 'all'],
    () => fetchOrders(storeName, 'all'),
    { refetchInterval: 5000 }
  )

  const preparingOrders = allOrders?.filter(order => !order.cookStatus && !order.getStatus)
  const readyOrders = allOrders?.filter(order => order.cookStatus && !order.getStatus)

  const updateOrderStatusMutation = useMutation(
    async ({ order, newStatus }: { order: Order; newStatus: 'ready' | 'completed' }) => {
      const cookStatus = newStatus === 'ready' ? true : false
      const getStatus = newStatus === 'completed' ? true : false
      
      // Update order status
      await fetch(`/api/StoreOrder/update/PatchOrderStatus?storeName=${storeName}&orderId=${order.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookStatus, getStatus }),
      })
      
      // Update order wait time
      await fetch(`/api/Utils/storeWaitTimeSuber`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderList: [{
            productId: order.orderList[0].productId,
            storeName: storeName,
            orderQuantity: order.orderList[0].orderQuantity
          }]
        }),
      })
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(['orders', storeName, 'all'])
        toast.success('送信完了', {
          position: 'top-right',
          duration: 3000,
        });
      },
    }
  )

  const updateOrderStatus = (order: Order, newStatus: 'ready' | 'completed') => {
    setIsUpdating(true)
    updateOrderStatusMutation.mutate(
      { order, newStatus },
      {
        onSettled: () => setIsUpdating(false)
      }
    )
  }

  const renderOrderCard = (order: Order) => (
    <Card key={order.orderId} className={`mb-4 ${!order.cookStatus ? 'bg-orange-100' : order.getStatus ? 'bg-gray-100' : 'bg-green-100'}`}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-20 mr-4">
            <div className="text-sm text-gray-500">整理券番号</div>
            <div className="text-4xl font-bold">{order.ticketNumber}</div>
          </div>
          <div className="flex-shrink-0 w-20 mr-4">
            <div className="text-sm mb-4">{order.clientName}</div>
            <div className="text-sm text-gray-500">{order.orderTime}</div>
          </div>
          {/* 商品リストの表示 */}
          <div className="flex-grow">
            <ul className="space-y-1">
              {order.orderList.map((item, index) => (
                <li key={index} className="flex justify-between text-sm font-bold">
                  <span>{item.productName} × {item.orderQuantity}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* 常体更新ボタン */}
          <div className="flex-shrink-0 ml-4">
            {!order.getStatus && (
              <Button 
                onClick={() => updateOrderStatus(order, order.cookStatus ? 'completed' : 'ready')}
                className="w-24 bg-gray-200 text-black hover:bg-gray-300"
              >
                {order.cookStatus ? '受け渡し完了' : '調理完了'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoadingAll) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>
  }

  if (errorAll) {
    return <div className="text-red-500">エラーが発生しました。再度お試しください。</div>
  }

  const handleShowAllOrders = () => {
    setShowAllOrders(true)
    setActiveTab('all')
  }

  const handleHideAllOrders = () => {
    setShowAllOrders(false)
    setActiveTab('preparing')
  }

  return (
    <div className="container mx-auto p-4 pb-20"> 
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'preparing' | 'ready' | 'all')}>  
        <TabsList className={`grid w-full mb-4 ${showAllOrders ? 'grid-cols-1' : 'grid-cols-2'}`}>  
          {showAllOrders ? ( 
            <TabsTrigger  
              value="all" 
              className="text-lg px-4 py-2 border-b-2 border-blue-500 text-center"> 
              全ての注文 
            </TabsTrigger> 
          ) : ( 
            <> 
              <TabsTrigger   
                value="preparing"   
                className={`text-lg px-4 py-2 ${activeTab === 'preparing' ? 'border-b-2 border-orange-500' : ''} text-center`}> 
                調理待ち 
              </TabsTrigger>   
              <TabsTrigger   
                value="ready"   
                className={`text-lg px-4 py-2 ${activeTab === 'ready' ? 'border-b-2 border-green-500' : ''} text-center`}> 
                受け渡し待ち 
              </TabsTrigger> 
            </> 
          )} 
        </TabsList>  
        {!showAllOrders && ( 
          <div> 
            <TabsContent value="preparing">  
              <div>  
                {preparingOrders?.map(order => renderOrderCard(order))}  
              </div>  
            </TabsContent>  
            <TabsContent value="ready">  
              <div>  
                {readyOrders?.map(order => renderOrderCard(order))}  
              </div>  
            </TabsContent>  
          </div> 
        )} 
        {showAllOrders && ( 
          <TabsContent value="all">  
            <div>  
              {allOrders?.map(order => renderOrderCard(order))}  
            </div>  
          </TabsContent>  
        )} 
      </Tabs> 

      <button 
        className={`${styles.button} ${showAllOrders ? styles.buttonSecondary : styles.buttonPrimary}`}
        onClick={showAllOrders ? handleHideAllOrders : handleShowAllOrders} 
      > 
        {showAllOrders ? '分けて表示' : '全て表示'} 
      </button>
      {isUpdating && <LoadingOverlay />}
      <Toaster />
    </div>
  )
}