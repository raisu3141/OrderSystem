import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/ticketcard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Loader2 } from 'lucide-react'

interface Product {
  productId: string;
  productName: string;
  productImageUrl: string;
}

interface OrderList {
  productId: Product;
  orderQuantity: number;
}

interface OrderId {
  orderId: string;
  tiketNumber: number;
  clientName: string;
}

interface Order {
  _id: string;
  orderId: OrderId;
  orderList: OrderList[];
  cookStatus: boolean;
  getStatus: boolean;
  orderTime: string; // もし必要であれば、注文日時も保持
}

async function fetchOrders(storeId: string, cookStatus: boolean, getStatus: boolean): Promise<Order[]> { 
  const response = await fetch(`/api/StoreOrder/getter/getOrders?storeId=${storeId}`, { 
    headers: { 
      // 'Cache-Control': 'no-cache', 
      // 'Pragma': 'no-cache' 
    } 
  }); 
  if (!response.ok) { 
    throw new Error('Failed to fetch orders'); 
  } 
  const data = await response.json(); // 取得したデータを変数に格納
  console.log(data); // データをコンソールに出力
  return data; // データを返す
}

interface OrderticketProps {
  storeId: string;
}

export default function OrderTicket({ storeId }: OrderticketProps) {
  const [activeTab, setActiveTab] = useState<'preparing' | 'ready'>('preparing')

  const { data: preparingOrders, isLoading: isLoadingPreparing, error: errorPreparing } = useQuery(
    ['orders', storeId, true, false],
    () => fetchOrders(storeId, true, false),
    { refetchInterval: 5000 } // Refetch every 5 seconds
  )

  const { data: readyOrders, isLoading: isLoadingReady, error: errorReady } = useQuery(
    ['orders', storeId, false, true],
    () => fetchOrders(storeId, false, true),
    { refetchInterval: 5000 } // Refetch every 5 seconds
  )

  const updateOrderStatus = async (orderId: string, newStatus: 'ready' | 'completed') => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    await Promise.all([
      fetchOrders(storeId, true, false),
      fetchOrders(storeId, false, true),
    ])
  }

  const renderOrderCard = (order: Order) => (
    <Card key={order.orderId.orderId} className="mb-4 bg-gray-100">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-20 mr-4">
            <div className="text-sm text-gray-500">整理券番号</div>
            <div className="text-4xl font-bold">{order.orderId.tiketNumber}</div>
          </div>
          <div className="flex-grow">
            <div className="text-sm mb-2">{order.orderId.clientName}</div>
            <ul className="space-y-1">
              {order.orderList.map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span>{item.productId.productName}</span>
                  <span>× {item.orderQuantity}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0 ml-4">
            <Button 
              onClick={() => updateOrderStatus(order.orderId.orderId, order.cookStatus === true ? 'ready' : 'completed')}
              className="w-24 bg-gray-200 text-black hover:bg-gray-300"
            >
              調理完了
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
          <TabsTrigger value="preparing" className="text-lg">注文一覧</TabsTrigger>
          <TabsTrigger value="ready" className="text-lg">受け渡し</TabsTrigger>
        </TabsList>
        <TabsContent value="preparing">
          <div>
            {preparingOrders?.map(renderOrderCard)}
          </div>
        </TabsContent>
        <TabsContent value="ready">
          <div>
            {readyOrders?.map(renderOrderCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}