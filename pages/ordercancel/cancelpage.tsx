import { useEffect, useState } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import Head from 'next/head';
import Header from '../../components/header';

interface Order {
  ticketNumber: number;
  clientName: string;
  totalAmount: number;
  orderList: { productId: string, orderQuantity: number, productName: string ,price: number }[];
}

async function fetchNotCanceledOrders() {
  // 未キャンセルの注文を取得する処理
  try {
    const response = await fetch('/api/Utils/getNotCanceledOrder');
    if (!response.ok) {
      throw new Error('Failed to fetch order list');
    }

    const data: Order[] = await response.json();
    console.log('Fetched order list:', data); // データを出力して確認

    return data;
  } catch (error) {
    console.error(error);
    console.log('データとれてないよ');
    return [];
  }
}

export default function OrderCancellation() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTicketNumber, setSearchTicketNumber] = useState("")
  const [searchCustomerName, setSearchCustomerName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [confirmTicketNumber, setConfirmTicketNumber] = useState("")
  const [confirmCustomerName, setConfirmCustomerName] = useState("")

  useEffect(() => {
    const loadOrders = async () => {
      const orders = await fetchNotCanceledOrders();
      setOrders(orders);
    }
    loadOrders();
  }, []);

  // 検索機能
  const filteredOrders = orders.filter(order =>
    order.ticketNumber.toString().includes(searchTicketNumber.toLowerCase()) &&
    order.clientName.toLowerCase().includes(searchCustomerName.toLowerCase())
  )


  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  // キャンセル確認
  const handleConfirmCancel = () => {
    if (selectedOrder &&
      confirmTicketNumber.trim() === selectedOrder.ticketNumber.toString().trim() &&
      confirmCustomerName.trim().toLowerCase() === selectedOrder.clientName.trim().toLowerCase()) {
      cancelOrder(selectedOrder.ticketNumber)
      setIsDialogOpen(false)
      setSelectedOrder(null)
      setConfirmTicketNumber("")
      setConfirmCustomerName("")
    }
  }

  const cancelOrder = async (ticketNumber: number) => {

    try {
      const response = await fetch('/api/Utils/cancelOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketNumber })
      });

      if (response.ok) {
        console.log('Order canceled:', ticketNumber);
        setOrders(orders.filter(order => order.ticketNumber !== ticketNumber))
      }

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <Head>
        <title>注文キャンセル</title>
      </Head>
      <Header />
      <div className= 'flex flex-col justify-start items-center min-h-screen'>
        <h1 className="text-2xl font-bold m-4">注文キャンセル</h1>

        {/* 検索欄 */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="注文番号で検索"
            value={searchTicketNumber}
            onChange={(e) => setSearchTicketNumber(e.target.value)}
          />
          <Input
            placeholder="注文者名で検索"
            value={searchCustomerName}
            onChange={(e) => setSearchCustomerName(e.target.value)}
          />
        </div>

        {/* 注文一覧 */}
        <Table style={{ width: '80%', margin: '0 auto' }}>
          <TableHeader>
            <TableRow>
              <TableHead>注文番号</TableHead>
              <TableHead>注文者名</TableHead>
              <TableHead>商品名</TableHead>
              <TableHead>個数</TableHead>
              <TableHead>合計金額</TableHead>
              <TableHead>アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              return (
                <TableRow key={order.ticketNumber}>
                  <TableCell>{order.ticketNumber}</TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  {/* 商品ID、屋台ID、個数を縦並びに表示 */}
                  <TableCell>
                    {order.orderList.map(product => (
                      <div key={product.productId}>{product.productName}</div>
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
                <Label htmlFor="confirmTicketNumber" className="text-right">
                  注文番号
                </Label>
                <Input
                  id="confirmTicketNumber"
                  value={confirmTicketNumber}
                  onChange={(e) => setConfirmTicketNumber(e.target.value)}
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
                disabled={!selectedOrder || confirmTicketNumber !== selectedOrder.ticketNumber.toString() || confirmCustomerName !== selectedOrder.clientName}
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
