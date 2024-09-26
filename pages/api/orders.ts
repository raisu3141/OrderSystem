import type { NextApiRequest, NextApiResponse } from 'next'

interface OrderList {
  name: string
  quantity: number
}

interface Order {
  orderid: number
  customerName: string
  orderlist: OrderList[]
  status: 'preparing' | 'ready' | 'completed'
}

// Mock data
const mockOrders: Order[] = [
  {
    orderid: 1,
    customerName: 'こうせん　たろう',
    orderlist: [
      { name: 'たこ焼き', quantity: 2 },
      { name: 'お好み焼き', quantity: 1 },
    ],
    status: 'preparing',
  },
  {
    orderid: 2,
    customerName: 'こうせん　はなこ',
    orderlist: [
      { name: '焼きそば', quantity: 1 },
      { name: 'かき氷', quantity: 1 },
    ],
    status: 'ready',
  },
  {
    orderid: 3,
    customerName: 'きなせいんだよ',
    orderlist: [
      { name: 'フランクフルト', quantity: 2 },
      { name: 'ポテト', quantity: 1 },
    ],
    status: 'preparing',
  },
  {
    orderid: 4,
    customerName: 'みやざとキュートボーイ',
    orderlist: [
      { name: 'チョコバナナ', quantity: 1 },
      { name: 'わたあめ', quantity: 1 },
    ],
    status: 'ready',
  },
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order[] | { message: string }>
) {
  if (req.method === 'GET') {
    const { storeId, cookStatus, getStatus } = req.query

    // Filter orders based on query parameters
    const filteredOrders = mockOrders.filter(order => {
      if (cookStatus === 'true' && order.status === 'preparing') return true
      if (getStatus === 'true' && order.status === 'ready') return true
      return false
    })

    res.status(200).json(filteredOrders)
  } else if (req.method === 'PATCH') {
    const { orderId } = req.query
    const { status } = req.body as { status: 'ready' | 'completed' }

    const orderIndex = mockOrders.findIndex(order => order.orderid === Number(orderId))
    if (orderIndex === -1) {
      res.status(404).json({ message: 'Order not found' })
      return
    }

    mockOrders[orderIndex].status = status
    res.status(200).json({ message: 'Order updated successfully' })
  } else {
    res.setHeader('Allow', ['GET', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}