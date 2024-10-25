// import { useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
// import { Button } from "../ui/button";
// import { Product, StoreList, CartItem } from "../../lib/types";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


// async function fetchProductList(): Promise<Product[]> {
//   try {
//     const response = await fetch(`/api/Utils/getStoreProductData`);
//     if (!response.ok) {
//       throw new Error('Failed to fetch product list');
//     }

//     const data: StoreList[] = await response.json();
//     console.log('Fetched product list:', data);

//     // 各商品の productList に storeId を追加
//     const allProducts: Product[] = data.flatMap(store =>
//       store.productList.map(product => ({
//         ...product,
//         storeId: store.storeId, // storeId を各商品に追加 
//         openDay: store.openDay // storeDay を各商品に追加
//       }))
//     );

//     console.log('All products:', allProducts);

//     return allProducts;
//   } catch (error) {
//     console.error(error);
//     return [];
//   }
// }

// export function ProductList() {
//   const [quantity, setQuantity] = useState(1);
//   const [isOpen, setIsOpen] = useState(false);
//   const [storeList, setStoreList] = useState<StoreList[]>([]);
//   const [productList, setProductList] = useState<Product[]>([]);
//   const [cart, setCart] = useState<CartItem[]>([]);

//   useEffect(() => {
//     const loadProducts = async () => {
//       const products = await fetchProductList();
//       setProductList(products);
//       setStoreList(storeList);
//     }
//     loadProducts();
//   }, []);

//   const addToCart = (product: Product, quantity: number) => {
//     setCart(prevCart => {
//       const existingItem = prevCart.find(item => item.productId === product.productId);
//       if (existingItem) {
//         return prevCart.map(item =>
//           item.productId === product.productId ? { ...item, quantity: item.quantity + quantity } : item
//         );
//       }
//       return [...prevCart, { ...product, quantity } as CartItem];
//     });
//   };

//   const removeFromCart = (id: string) => {
//     setCart(prevCart => prevCart.filter(item => item.productId !== id));
//   };

//   const quantityChange = (id: string, quantity: number) => {
//     setCart(prevCart =>
//       prevCart.map(item =>
//         item.productId === id ? { ...item, quantity } : item
//       )
//     );
//   };

//   const filterProductDay = (day: number) => {
//     return productList.filter(product => product.openDay === day);
//   };

//   const handleAddToCart = () => {
//     addToCart(product, quantity); // カートに追加
//     setQuantity(1); // 数量をリセット
//     setIsOpen(false); // ダイアログを閉じる
//   };

//   const productButton = (product:Product) => {
//     (
//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button
//           variant="outline"
//           className="bg-white w-full h-auto aspect-square flex flex-col items-center justify-center p-0 "
//           disabled={product.stock === 0}
//         >
//           <div className="bg-gray-500 w-full h-48">
//             <img
//               src={product.productImageUrl}
//               alt={product.productName}
//               className="w-full h-48 object-cover"
//             />
//           </div>
//           <div className="p-4">
//             <h2 className="text-xl font-semibold">{product.productName}</h2>
//             <h2 className="text-xl font-semibold">￥{product.price}</h2>
//           </div>
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="bg-white flex flex-col items-center">
//         <VisuallyHidden>
//           <DialogTitle>個数入力ダイアログ</DialogTitle>
//         </VisuallyHidden>
//         <img
//           src={product.productImageUrl}
//           alt={product.productName}
//           className="w-50 h-48 object-contain mb-4"
//         />
//         <span className="text-left font-semibold w-80">{product.productName}</span>
//         <div className="flex items-center justify-between w-80">
//           <span className="text-2xl font-semibold">￥{product.price}</span>
//           <select
//             value={quantity}
//             onChange={(e) => setQuantity(parseInt(e.target.value))}
//             className="w-20 h-10 border rounded-md"
//           >
//             <option value="" disabled>
//               選択してください
//             </option>
//             {Array.from({ length: product.stock }, (_, index) => (
//               <option key={index + 1} value={index + 1}>
//                 {index + 1}
//               </option>
//             ))}
//           </select>
//         </div>
//         <Button onClick={handleAddToCart}>カートに追加</Button>
//       </DialogContent>
//     </Dialog>
//     )
//   }

//   return (
//     <div></div>      
      


//   );
// }
