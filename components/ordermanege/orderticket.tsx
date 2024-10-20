'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/ticketcard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { AlertCircle, Loader2 } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

import styles from '../../components/ordermanege/orderticket.module.css'
import { all } from 'axios'

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
  cancelStatus: boolean;
  getStatus: boolean;
  orderId: string;
  orderList: OrderList[];
  ticketNumber: number;
  orderTime: string;
}

async function fetchOrders(storeName: string, status: 'preparing' | 'ready' | 'all', isSSE: boolean, isCancelUpdate: boolean): Promise<Order[]> {
  const response = await fetch(`/api/StoreOrder/getter/getOrders?storeName=${storeName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const data: Order[] = await response.json();
  
  if (isSSE) {
    console.log('SSEによる更新:', data);
  } else if (isCancelUpdate) {
    console.log('キャンセルによる更新:', data);
  } else {
    console.log('通常の取得:', data);
  }

  return data;
}

interface OrderticketProps {
  storeName: string;
}

export default function OrderTicket({ storeName }: OrderticketProps) {
  const [activeTab, setActiveTab] = useState<'preparing' | 'ready' | 'active' | 'etc'>('preparing')
  const [showAllOrders, setShowAllOrders] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const queryClient = useQueryClient()
  const isSSERef = useRef(false)
  const isCancelUpdateRef = useRef(false)
  const previousOrdersRef = useRef<Order[]>([])

  const showCancelNotification = (order: Order) => {
    toast((t) => (
      <div className="flex flex-col items-start p-4 bg-white border-2 border-red-500 rounded-lg shadow-lg">
        <p className="font-bold mb-2 text-red-500">注文がキャンセルされました</p>
        <p>注文番号: {order.ticketNumber}</p>
        <p>注文者名: {order.clientName}</p>
        <ul className="w-full mt-2">
          {order.orderList.map((item, index) => (
            <li key={index} className="flex justify-between text-sm font-bold">
              <span>{item.productName} × {item.orderQuantity}</span>
            </li>
          ))}
        </ul>
        <Button 
          onClick={() => {
            toast.dismiss(t.id);
          }}
          className="mt-4 bg-red-500 text-white hover:bg-red-600"
        >
          確認
        </Button>
      </div>
    ), {
      duration: Infinity,
      position: 'top-right',
    });
  };

  const { data: allOrders, isLoading: isLoadingAll, error: errorAll, refetch } = useQuery(
    ['orders', storeName, 'all'],
    () => fetchOrders(storeName, 'all', isSSERef.current, isCancelUpdateRef.current),
    { 
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (newOrders) => {
        const updatedOrders = newOrders.map(newOrder => {
          const previousOrder = previousOrdersRef.current.find(order => order.orderId === newOrder.orderId);
          if (previousOrder && !previousOrder.cancelStatus && newOrder.cancelStatus) {
            showCancelNotification(newOrder);
          }
          return newOrder;
        });
        queryClient.setQueryData(['orders', storeName, 'all'], updatedOrders);
        previousOrdersRef.current = newOrders;
        isCancelUpdateRef.current = false;
      }
    }
  )

  useEffect(() => {
    const eventSource = new EventSource(`/api/StoreOrder/getter/realTimeOrders?storeName=${storeName}`);

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'cancel') {
        console.log('Received cancel update');
        isCancelUpdateRef.current = true;
      } else {
        console.log('Received SSE update');
        isSSERef.current = true;
      }

      try {
        await refetch();
        isSSERef.current = false;
        toast.success('注文が更新されました', {
          position: 'top-right',
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to refetch orders:', error);
        toast.error('注文の更新に失敗しました', {
          position: 'top-right',
          duration: 3000,
        });
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [storeName, refetch]);

  const preparingOrders = allOrders?.filter(order => !order.cookStatus && !order.getStatus && !order.cancelStatus)
  const readyOrders = allOrders?.filter(order => order.cookStatus && !order.getStatus && !order.cancelStatus)
  const activeOrders = allOrders?.filter(order => !order.getStatus && !order.cancelStatus)
  const etcOrders = allOrders?.filter(order => order.getStatus || order.cancelStatus)

  const updateOrderStatusMutation = useMutation(
    async ({ order, newStatus }: { order: Order; newStatus: 'ready' | 'completed' }) => {
      const cookStatus = newStatus === 'ready' || newStatus === 'completed'
      const getStatus = newStatus === 'completed'
      
      await fetch(`/api/StoreOrder/update/PatchOrderStatus?storeName=${storeName}&orderId=${order.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookStatus, getStatus }),
      })
      
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

  const renderOrderCard = (order: Order) => {
    const cardClassName = `mb-4 ${
      order.cancelStatus ? 'bg-red-100 border-2 border-red-500' :
      !order.cookStatus ? 'bg-orange-100' :
      order.getStatus ? 'bg-gray-50' : 'bg-green-100'
    }`;

    return (
      <Card key={order.orderId} className={cardClassName}>
        <CardContent className="p-4">
          <div className="flex items-stretch h-full divide-x divide-gray-300">
            <div className="flex-shrink-0 w-24 pr-4">
              <div className="text-sm text-gray-500">整理券番号</div>
              <div className="text-4xl font-bold">{order.ticketNumber}</div>
            </div>
            <div className="flex-shrink-0 w-32 px-4 flex flex-col">
              <div className="text-sm">{order.clientName}</div>
              <div className="text-sm text-gray-500 mt-4">{order.orderTime}</div>
            </div>
            <div className="flex-grow px-4 flex flex-col">
              <ul className="space-y-1">
                {order.orderList.map((item, index) => (
                  <li key={index} className="flex justify-between text-sm font-bold">
                    <span>{item.productName} × {item.orderQuantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0 pl-4 flex">
              {!order.getStatus && !order.cancelStatus ? (
                <Button 
                  onClick={() => updateOrderStatus(order, order.cookStatus ? 'completed' : 'ready')}
                  className="mt-2 w-24 bg-gray-200 text-black hover:bg-gray-300"
                >
                  {order.cookStatus ? '受け渡し完了' : '調理完了'}
                </Button>
              ) : (
                <div className="w-24 text-black flex items-center justify-center">
                  {order.cancelStatus ? 'キャンセル' : 'completed'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoadingAll) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>
  }
  if (errorAll) {
    return <div className="text-red-500 items-center">エラーが発生しました。再度お試しください。</div>
  }

  const handleShowAllOrders = () => {
    setShowAllOrders(true)
    setActiveTab('active')
  }

  const handleHideAllOrders = () => {
    setShowAllOrders(false)
    setActiveTab('preparing')
  }

  return (
    <div className="container mx-auto p-4 pb-20"> 
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'preparing' | 'ready' | 'active' | 'etc')}>  
        <TabsList className={`grid w-full mb-4 grid-cols-2`}>  
          {showAllOrders ? ( 
            <>
              <TabsTrigger  
                value="active" 
                className={`text-lg px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-blue-500' : ''} text-center`}> 
                全ての注文 
              </TabsTrigger> 
              <TabsTrigger
                value="etc"
                className={`text-lg px-4 py-2  ${activeTab === 'etc' ? 'border-b-2 border-gray-500' : ''} text-center`}>
                完了・キャンセル
              </TabsTrigger>
            </>
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
          <div>
            <TabsContent value="active">  
              <div>  
                {activeOrders?.map(order => renderOrderCard(order))}  
              </div>  
            </TabsContent>  
            <TabsContent value="etc">
              <div>
                {etcOrders?.map(order => renderOrderCard(order))}
              </div>
            </TabsContent>
          </div>
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