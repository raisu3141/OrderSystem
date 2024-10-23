import { useEffect, useState } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import Head from 'next/head';
import Header from '../../components/header';
import { Loader2 } from 'lucide-react';
import { set } from 'mongoose'

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <Loader2 className="animate-spin text-white w-16 h-16" />
  </div>
)


interface Order {
  ticketNumber: number;
  clientName: string;
  totalAmount: number;
  orderList: { productId: string, orderQuantity: number, productName: string, price: number }[];
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
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      const orders = await fetchNotCanceledOrders();
      setOrders(orders);
      setIsLoading(false);
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
      setIsDialogOpen(false)
      setConfirmTicketNumber("")
      setConfirmCustomerName("")
      setIsCancelDialogOpen(true)
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
        setIsLoading(false);
        handleConfirmCancel()
        setOrders(orders.filter(order => order.ticketNumber !== ticketNumber))
      } else {
        setIsLoading(false);
        setIsErrorDialogOpen(true)
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
      <div className='flex flex-col justify-start items-center min-h-screen'>
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
                onClick={() => {
                  if (selectedOrder?.ticketNumber !== undefined) {
                    cancelOrder(selectedOrder.ticketNumber);
                    setIsLoading(true);
                  }
                }}
                disabled={!selectedOrder || confirmTicketNumber !== selectedOrder.ticketNumber.toString() || confirmCustomerName !== selectedOrder.clientName}
              >
                注文をキャンセルする
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* キャンセル完了ダイアログ */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="bg-white flex flex-col items-center w-[80vw] max-w-[1200px] h-[80vh] max-h-[80vh]">
            <DialogTitle className="text-5xl font-semibold">キャンセル完了</DialogTitle>
            <div className="w-full h-full flex flex-col items-center text-2xl mt-12">
              <p>整理券番号</p>
              <p className="text-9xl font-semibold mt-5">{selectedOrder?.ticketNumber}</p>
              <p className="mt-8">{selectedOrder?.clientName}様</p>
              <p className="mt-14">注文がキャンセルされました</p>
            </div>
            {/* 閉じる */}
            <Button
              className="w-[50%] mt-4"
              onClick={() => {
                setIsCancelDialogOpen(false)
                setSelectedOrder(null)
              }}
            >
              閉じる
            </Button>
          </DialogContent>
        </Dialog>

        {/* エラーダイアログ */}
        <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
          <DialogContent className="bg-white flex flex-col items-center w-[50vw] max-w-[1200px] h-[50vh] max-h-[80vh]">
            <DialogTitle className="text-3xl font-semibold">キャンセルエラー</DialogTitle>
            <div className="w-full h-full flex flex-col items-center text-2xl mt-12">
              <p className="mt-14">キャンセルできませんでした</p>
              <p>再度送信お願いします</p>
            </div>
            {/* 閉じる */}
            <Button
              className="w-[50%] mt-4"
              onClick={() => {
                setIsErrorDialogOpen(false)
              }}
            >
              閉じる
            </Button>
          </DialogContent>
        </Dialog>

        {isLoading && <LoadingOverlay />}
      </div>
    </div>
  )
}
