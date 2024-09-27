import { ScrollArea } from '@radix-ui/react-scroll-area';
import Styles from '../../styles/orderInput.module.css';
import { CartItem } from '@/lib/types';

interface CartProps {
  cart: CartItem[];
}

export default function Cart({ cart }: CartProps) {
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div className={Styles.cartcontainer}>
      <div className={Styles.cart}>
        <h2 className="text-center font-semibold mb-4 border-b-2">注文内容</h2>
        <ScrollArea className="h-[calc(85%-4rem)]"> {/* 高さを調整 */}
          <div>
            {cart.map(item => (
              <div key={item.id}>
                <span>{item.productName} x{item.quantity}</span>
                <span>¥{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="total-container mt-4"> {/* 合計のコンテナ */}
          <div className="flex justify-between items-center font-semibold">
            <span>合計</span>
            <span>￥{totalAmount}</span>
          </div>
        </div>
        <button className="w-full bg-blue-500 text-white font-semibold py-2 mt-4">注文</button>
      </div >
    </div >
  );
};