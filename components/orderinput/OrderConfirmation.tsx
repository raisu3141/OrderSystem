import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from '@radix-ui/react-scroll-area';
import Styles from '../../styles/orderInput.module.css'; // スタイルのインポート
import { CartItem } from '../../lib/types'; // カートアイテムの型をインポート
import OrderCompleted from "./OrderCompleted";

interface OrderConfirmationProps {
  cart: CartItem[]; // カートの内容を受け取る
  totalAmount: number; // 合計金額を受け取る
  onClose: () => void; // 閉じるための関数を受け取る
  onRemove: (id: number) => void; // 削除関数を追加
}

export default function OrderConfirmation({ cart, totalAmount, onClose, onRemove }: OrderConfirmationProps) {
  const [depositAmount, setDepositAmount] = useState<number | undefined>(); // お預かり金額のステート
  const [clientName, setClientName] = useState<string | undefined>(); // お名前のステート
  const [isOpen, setIsOpen] = useState(false); // ダイアログのオープン状態を管理

  const resetForm = () => {
    setClientName('');
    setDepositAmount(undefined);
    setIsOpen(false);
    for (let i = 0; i < cart.length; i++) {
      onRemove(cart[i].id);
    }
  };

  return (
    <>
      <DialogContent className="bg-white flex flex-col items-center w-[80vw] max-w-[1200px] h-[80vh] max-h-[80vh]">
        <DialogHeader className="text-4xl font-semibold">注文確認</DialogHeader>

        {/* 横並びのレイアウト */}
        <div className="w-full h-full flex flex-row items-center">
          <div className=" w-[50%] h-full flex flex-col items-center">
            {/* 名前入力 */}
            <div className="text-xl font-semibold mt-10">お名前</div>
            <input
              type="text"
              className="w-[70%] h-10 border-2 rounded-md"
              placeholder="コウセンタロウ"
              onChange={(e) => setClientName(e.target.value)}
            />
            {/* お預かり金額入力 */}
            <div className="text-xl font-semibold mt-5">お預かり金額</div>
            <input
              type="number"
              className="w-[70%] h-10 border-2 rounded-md"
              placeholder="お預かり金額"
              value={depositAmount || ''}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
            />

            {/* 注意書き */}
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

          {/* 注文内容エリア */}
          <div className={Styles.ordercartcontainer}>
            <div className={Styles.cart}>
              <ScrollArea className="h-[calc(95%-4rem)] overflow-auto border-b-2 mt-2">
                {cart.map(item => (
                  <div key={item.id} className="border-b-2 mb-3">
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

        {/* 注文ボタン */}
        <Button
          className="w-[50%] mt-4"
          onClick={() => {setIsOpen(true); onClose();}} // ダイアログを開く
          disabled={!clientName} // お名前が入力されていない場合はボタンを無効化
        >
          注文
        </Button>
      </DialogContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* OrderCompleted コンポーネントに clientName を渡す */}
        <OrderCompleted clientName={clientName} onClose={() => {setIsOpen(false); resetForm();}} />
      </Dialog>
    </>
  );
}
