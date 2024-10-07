import { useEffect, useState } from "react";
import { ScrollArea } from '@radix-ui/react-scroll-area';
import Styles from '../../styles/orderInput.module.css';
import { CartItem } from '@/lib/types';
import { Button } from "../ui/button";
import OrderConfirmation from '@/components/orderinput/OrderConfirmation'; // OrderConfirmationをインポート
import { Dialog } from "@radix-ui/react-dialog";

interface CartProps {
  cart: CartItem[]; // initialCartをcartに変更
  onRemove: (id: number) => void; // 削除関数を追加
  onQuantityChange: (id: number, quantity: number) => void; // 数量変更関数を追加
}

export default function Cart({ cart, onRemove, onQuantityChange }: CartProps) {
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false); // ダイアログのオープン状態を管理

  const handleRemove = (id: number) => {
    onRemove(id); // 親の削除関数を呼び出す
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    onQuantityChange(id, quantity); // 親の数量変更関数を呼び出す
  };

  useEffect(() => {
    console.log('カート内容:', cart); // カートの内容をログに出力
  }, [cart]);

  return (
    <>
      <div className={Styles.cartcontainer}>
        <div className={Styles.cart}>
          <h2 className="text-center text-xl font-semibold mb-1 border-b-2">注文内容</h2>
          <ScrollArea className="h-[calc(85%-4rem)] overflow-auto">
            {cart.map(item => (
              <div key={item.id} className="border-b-2 mb-1">
                <div className="flex items-center justify-between space-x-4 mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={item.productImageURL}
                        alt={item.productName}
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{item.productName}</span>
                      <span>¥{item.price}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Button
                      variant="link"
                      className="text-gray-500 p-0"
                      onClick={() => handleRemove(item.id)}
                    >×</Button>
                    <select
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                      className="w-16 h-9 border-b-2 rounded-md"
                    >
                      {Array.from({ length: Math.min(item.stock, 10) }, (_, index) => ( // 最大数量を制限
                        <option key={index + 1} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="total-container mt-4">
            <div className="flex justify-between items-center font-semibold">
              <span>合計</span>
              <span>￥{totalAmount}</span>
            </div>
          </div>
          <Button
            className="w-full mt-4"
            onClick={() => setIsOpen(true)} // ダイアログを開く
            disabled={cart.length === 0} // カートが空の場合はボタンを無効化
          >注文</Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <OrderConfirmation cart={cart} totalAmount={totalAmount} onRemove={onRemove} onClose={() => setIsOpen(false)} />
      </Dialog>
    </>
  );
}
