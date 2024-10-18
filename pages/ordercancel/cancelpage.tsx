import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import Head from 'next/head';
import Header from '../../components/header';
import Styles from '../../styles/orderInput.module.css';

type ProductList = {
  productId: string;  // 商品ID
  storeId: string;    // 屋台ID
  orderQuantity: number;  // 注文数量
  price: number; // 商品の値段
};

type Order = {
  id: string;  // 注文ID
  ticketNumber: number;  // 整理券番号
  lineUserId: string;  // LINEユーザーID
  orderList: ProductList[];  // 注文商品のリスト
  clientName: string;  // クライアント名（カタカナ）
  totalAmount: number; // 合計金額
  orderTime: Date;  // 注文時間（yyyy/MM/dd HH/mm/ss）
};

// サンプルデータ
const initialOrders: Order[] = [
  {
    id: "ORD001",
    ticketNumber: 1,
    lineUserId: "USER123",
    orderList: [
      { productId: "PRD001", storeId: "STR001", orderQuantity: 2, price: 500 },
      { productId: "PRD002", storeId: "STR002", orderQuantity: 1, price: 700 }
    ],
    clientName: "ヤマダタロウ",
    totalAmount: 500 * 2 + 700 * 1,  // 1700円
    orderTime: new Date("2024-10-01 10:30:00")
  },
  {
    id: "ORD002",
    ticketNumber: 2,
    lineUserId: "USER124",
    orderList: [
      { productId: "PRD003", storeId: "STR001", orderQuantity: 3, price: 300 }
    ],
    clientName: "サトウハナコ",
    totalAmount: 300 * 3,  // 900円
    orderTime: new Date("2024-10-01 11:00:00")
  },
  {
    id: "ORD003",
    ticketNumber: 3,
    lineUserId: "USER125",
    orderList: [
      { productId: "PRD004", storeId: "STR003", orderQuantity: 1, price: 1000 }
    ],
    clientName: "スズキイチロウ",
    totalAmount: 1000 * 1,  // 1000円
    orderTime: new Date("2024-10-01 11:30:00")
  },
  {
    id: "ORD004",
    ticketNumber: 4,
    lineUserId: "USER126",
    orderList: [
      { productId: "PRD005", storeId: "STR002", orderQuantity: 2, price: 600 }
    ],
    clientName: "タナカジロウ",
    totalAmount: 600 * 2,  // 1200円
    orderTime: new Date("2024-10-01 12:00:00")
  },
  {
    id: "ORD005",
    ticketNumber: 5,
    lineUserId: "USER127",
    orderList: [
      { productId: "PRD006", storeId: "STR003", orderQuantity: 3, price: 800 }
    ],
    clientName: "イトウサブロウ",
    totalAmount: 800 * 3,  // 2400円
    orderTime: new Date("2024-10-01 12:30:00")
  },
  {
    id: "ORD006",
    ticketNumber: 6,
    lineUserId: "USER128",
    orderList: [
      { productId: "PRD007", storeId: "STR001", orderQuantity: 1, price: 500 }
    ],
    clientName: "クドウシロウ",
    totalAmount: 500 * 1,  // 500円
    orderTime: new Date("2024-10-01 13:00:00")
  },
  {
    id: "ORD007",
    ticketNumber: 7,
    lineUserId: "USER129",
    orderList: [
      { productId: "PRD008", storeId: "STR002", orderQuantity: 2, price: 400 }
    ],
    clientName: "ナカムラジロウ",
    totalAmount: 400 * 2,  // 800円
    orderTime: new Date("2024-10-01 13:30:00")
  },
  {
    id: "ORD008",
    ticketNumber: 8,
    lineUserId: "USER130",
    orderList: [
      { productId: "PRD009", storeId: "STR003", orderQuantity: 3, price: 300 }
    ],
    clientName: "ハヤシハナコ",
    totalAmount: 300 * 3,  // 900円
    orderTime: new Date("2024-10-01 14:00:00")
  },
  {
    id: "ORD009",
    ticketNumber: 9,
    lineUserId: "USER131",
    orderList: [
      { productId: "PRD010", storeId: "STR001", orderQuantity: 1, price: 900 }
    ],
    clientName: "ヤマグチタロウ",
    totalAmount: 900 * 1,  // 900円
    orderTime: new Date("2024-10-01 14:30:00")
  },
  {
    id: "ORD010",
    ticketNumber: 10,
    lineUserId: "USER132",
    orderList: [
      { productId: "PRD011", storeId: "STR002", orderQuantity: 2, price: 700 }
    ],
    clientName: "ワタナベジロウ",
    totalAmount: 700 * 2,  // 1400円
    orderTime: new Date("2024-10-01 15:00:00")
  },
  {
    id: "ORD011",
    ticketNumber: 11,
    lineUserId: "USER133",
    orderList: [
      { productId: "PRD012", storeId: "STR003", orderQuantity: 3, price: 600 }
    ],
    clientName: "イシイハナコ",
    totalAmount: 600 * 3,  // 1800円
    orderTime: new Date("2024-10-01 15:30:00")
  },
];

export default function OrderCancellation() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchOrderId, setSearchOrderId] = useState("")
  const [searchCustomerName, setSearchCustomerName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [confirmOrderId, setConfirmOrderId] = useState("")
  const [confirmCustomerName, setConfirmCustomerName] = useState("")

  // 検索機能
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchOrderId.toLowerCase()) &&
    order.clientName.toLowerCase().includes(searchCustomerName.toLowerCase())
  )

  // キャンセルボタンのハンドラー
  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  // キャンセル確認
  const handleConfirmCancel = () => {
    if (selectedOrder &&
      confirmOrderId === selectedOrder.id &&
      confirmCustomerName === selectedOrder.clientName) {
      setOrders(orders.filter(order => order.id !== selectedOrder.id))
      setIsDialogOpen(false)
      setSelectedOrder(null)
      setConfirmOrderId("")
      setConfirmCustomerName("")
    }
  }

  return (
    <div>
      <Head>
        <title>注文キャンセル</title>
      </Head>
      <Header />
      <div className={`${Styles.maincontainer} flex flex-col`}>
        <h1 className="text-2xl font-bold mb-4">注文キャンセル</h1>

        {/* 検索欄 */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="注文番号で検索"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
          />
          <Input
            placeholder="注文者名で検索"
            value={searchCustomerName}
            onChange={(e) => setSearchCustomerName(e.target.value)}
          />
        </div>

        {/* 注文一覧 */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>注文番号</TableHead>
              <TableHead>注文者名</TableHead>
              <TableHead>商品ID</TableHead>
              <TableHead>個数</TableHead>
              <TableHead>合計金額</TableHead>
              <TableHead>アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              return (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  {/* 商品ID、屋台ID、個数を縦並びに表示 */}
                  <TableCell>
                    {order.orderList.map(product => (
                      <div key={product.productId}>{product.productId}</div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {order.orderList.map(product => (
                      <div key={product.productId}>{product.orderQuantity}</div>
                    ))}
                  </TableCell>
                  <TableCell>{order.totalAmount}円</TableCell>
                  <TableCell>
                    <Button variant="destructive" onClick={() => handleCancelClick(order)}>
                      キャンセル
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* キャンセル確認ダイアログ */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='bg-white'>
            <DialogHeader>
              <DialogTitle>注文キャンセルの確認</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmOrderId" className="text-right">
                  注文番号
                </Label>
                <Input
                  id="confirmOrderId"
                  value={confirmOrderId}
                  onChange={(e) => setConfirmOrderId(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmCustomerName" className="text-right">
                  注文者名
                </Label>
                <Input
                  id="confirmCustomerName"
                  value={confirmCustomerName}
                  onChange={(e) => setConfirmCustomerName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={!selectedOrder || confirmOrderId !== selectedOrder.id || confirmCustomerName !== selectedOrder.clientName}
              >
                注文をキャンセルする
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

  )
}
