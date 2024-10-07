// import { useEffect, useState } from "react";
// import { ScrollArea } from '@radix-ui/react-scroll-area';
// import Styles from '../../styles/orderInput.module.css';
// import { CartItem } from '@/lib/types';
// import { Button } from "../ui/button";

// interface CartProps {
//   cart: CartItem[]; // initialCartをcartに変更
// }

// export default function Cart({ cart: initialCart }: CartProps) {
//   const [cart, setCart] = useState<CartItem[]>(initialCart);
  
//   useEffect(() => {
//     // setCart(cart); // cartが変更されたらカートを更新
//     setCart(initialCart); // initialCartが変更されたらカートを更新
//   }, [initialCart]);

//   const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   const handleRemove = (id: number) => {
//     setCart(prevCart => prevCart.filter(item => item.id !== id));
//     setCart(previnitialCart => previnitialCart.filter(item => item.id !== id));
//   };

//   const handleQuantityChange = (id: number, quantity: number) => {
//     setCart(prevCart =>
//       prevCart.map(item =>
//         item.id === id ? { ...item, quantity } : item
//       )
//     );
//   };

//   useEffect(() => {
//     console.log('カート内容:', cart); // カートの内容をログに出力
//     console.log('内容:', initialCart); // カートの内容をログに出力
//   }, [cart, initialCart]);

//   return (
//     <div className={Styles.cartcontainer}>
//       <div className={Styles.cart}>
//         <h2 className="text-center text-xl font-semibold mb-1 border-b-2">注文内容</h2>
//         <ScrollArea className="h-[calc(85%-4rem)] overflow-auto">
//           {initialCart.map(item => (
//             <div key={item.id} className="border-b-2 mb-1">
//               <div className="flex items-center justify-between space-x-4 mb-3">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
//                     <img
//                       src={item.productImageURL}
//                       alt={item.productName}
//                       className="w-12 h-12 object-cover"
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-sm font-semibold">{item.productName}</span>
//                     <span>¥{item.price}</span>
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-end">
//                   <Button
//                     variant="link"
//                     className="text-gray-500 p-0"
//                     onClick={() => handleRemove(item.id)}
//                   >×</Button>
//                   <select
//                     value={item.quantity}
//                     onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
//                     className="w-16 h-10 border-b-2 rounded-md"
//                   >
//                     {Array.from({ length: Math.min(item.stock, 10) }, (_, index) => ( // 最大数量を制限
//                       <option key={index + 1} value={index + 1}>
//                         {index + 1}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </ScrollArea>
//         <div className="total-container mt-4">
//           <div className="flex justify-between items-center font-semibold">
//             <span>合計</span>
//             <span>￥{totalAmount}</span>
//           </div>
//         </div>
//         <Button 
//           className="w-full mt-4"
//           onClick={() => console.log('注文内容:', cart)} // デバッグ用
//         >注文</Button>
//       </div>
//     </div>
//   );
// }
