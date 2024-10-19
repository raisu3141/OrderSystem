import { useState, useEffect, use } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from '@radix-ui/react-scroll-area';
import Styles from '../../styles/orderInput.module.css';
import { CartItem } from '../../lib/types';
import OrderCompleted from "./OrderCompleted";
import { set } from "mongoose";

interface OrderConfirmationProps {
  cart: CartItem[];
  totalAmount: number;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export default function OrderConfirmation({ cart, totalAmount, onClose, onRemove }: OrderConfirmationProps) {
  const [depositAmount, setDepositAmount] = useState<number | undefined>();
  const [clientName, setClientName] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<number | undefined>();
  const [stockStatusList, setStockStatusList] = useState<{ productId: string, stock: number }[]>([]);
  const [stock, setStock] = useState<{ [productId: string]: number }>({});

  const resetForm = () => {
    setClientName('');
    setDepositAmount(undefined);
    setIsOpen(false);
    setIsErrorOpen(false);

    // 在庫更新処理
    stockStatusList.forEach(stockStatus => {
      console.log(`Updating stock for productId: ${stockStatus.productId}, new stock: ${stockStatus.stock}`);
      updateLocalStock(stockStatus.productId, stockStatus.stock);
    });

    for (let i = 0; i < cart.length; i++) {
      onRemove(cart[i].productId);
    }
  };

  const updateLocalStock = (productId: string, newStock: number) => {
    setStock(prevStock => ({
      ...prevStock,
      [productId]: newStock
    }));
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const katakanaRegex = /^[ァ-ヶー]+$/;

    if (katakanaRegex.test(inputValue) || inputValue === '') {
      setClientName(inputValue);
      setErrorMessage('');
    } else {
      setErrorMessage('お名前はカタカナで入力してください');
    }
  }

  const postOrder = async () => {
    const orderList = cart.map(item => ({
      productId: item.productId,
      storeId: item.storeId,
      orderQuantity: item.quantity,
    }));

    const requestBody = {
      clientName,
      orderList,
    };

    try {
      const response = await fetch('/api/Utils/postOrderData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Order completed', responseData);
        setTicketNumber(responseData.ticketNumber);
        setStockStatusList(responseData.stockStatusList);
        setIsOpen(true);
        onClose();
        // resetForm();

      } else {
        console.error('Failed to post order');
        const errorData = await response.json();
        console.log('Error response:', errorData);
        setIsErrorOpen(true);
      }
    } catch (error) {
      console.error('Error posting order:', error);
      setIsErrorOpen(true);
    }
  };

  return (
    <>
      <DialogContent className="bg-white flex flex-col items-center w-[80vw] max-w-[1200px] h-[80vh] max-h-[80vh]">
        <DialogTitle className="text-4xl font-semibold">注文確認</DialogTitle>
        <div className="w-full h-full flex flex-row items-center">
          <div className="w-[50%] h-full flex flex-col items-center">
            <div className="text-xl font-semibold mt-10"><p>お名前(カタカナ)</p></div>
            <input
              type="text"
              className="w-[70%] h-10 border-2 rounded-md"
              placeholder="コウセンタロウ"
              onChange={handleInputChange}
            />
            <div className="text-xl font-semibold mt-5">お預かり金額</div>
            <input
              type="number"
              className="w-[70%] h-10 border-2 rounded-md"
              placeholder="お預かり金額"
              value={depositAmount || ''}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
            />

            <div className="mt-20">
              <div className="bg-white w-auto h-auto border-2 rounded-md flex flex-col items-center p-4">
                <div className="text-base font-semibold">
                  <p>ご注文が確定しますと、</p>
                  <p className="text-red-500">・内容の変更、キャンセル</p>
                  <p className="text-red-500">・返金対応</p>
                  <p>はできませんので、ご了承ください。</p>
                </div>
              </div>
            </div>
          </div>

          <div className={Styles.ordercartcontainer}>
            <div className={Styles.cart}>
              <ScrollArea className="h-[calc(95%-4rem)] overflow-auto border-b-2 mt-2">
                {cart.map(item => (
                  <div key={item.productId} className="border-b-2 mb-3">
                    <div className="flex items-center justify-between space-x-4 mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="w-12 h-12 object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{item.productName}</span>
                          <span>¥{item.price}</span>
                        </div>
                      </div>
                      <div className="bg-white w-16 h-9 border-2 rounded-md flex flex-row-reverse items-center">
                        <span className="text-lg mr-3">{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex justify-between text-xl font-semibold mt-2">
                <span>合計</span>
                <span>￥{totalAmount}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold">
                <span>お釣り</span>
                <span>￥{depositAmount ? depositAmount - totalAmount : 0}</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          className="w-[50%] mt-4"
          onClick={() => { postOrder(); }}
          disabled={!clientName || (depositAmount === undefined || depositAmount < totalAmount)}
        >
          注文
        </Button>
      </DialogContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <OrderCompleted clientName={clientName} ticketNumber={ticketNumber} onClose={() => { setIsOpen(false); resetForm(); }} />
      </Dialog>

      {/* <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white flex flex-col items-center w-[80vw] max-w-[1200px] h-[80vh] max-h-[80vh]">
          <DialogTitle className="text-5xl font-semibold">注文完了</DialogTitle>
          <div className="w-full h-full flex flex-col items-center text-2xl mt-12">
            <p>整理券番号</p>
            <p className="text-9xl font-semibold mt-5">{ticketNumber}</p>
            <p className="mt-8">{clientName}様</p>
            <p className="mt-14">LINE BOTで整理番号を</p>
            <p>入力してください</p>
          </div> */}
          {/* 閉じる */}
          {/* <Button
            className="w-[50%] mt-4"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            閉じる
          </Button>
        </DialogContent>
      </Dialog> */}

      <Dialog open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <DialogContent className="bg-white flex flex-col items-center w-[80vw] max-w-[1200px] h-[80vh] max-h-[80vh]">
          <DialogTitle className="text-5xl font-semibold">注文エラー</DialogTitle>
          <div className="w-full h-full flex flex-col items-center text-2xl mt-12">
            <p>再度注文お願いします</p>
          </div>
          <Button className="w-[50%] mt-4" onClick={() => {setIsErrorOpen(false); resetForm()}}>閉じる</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
