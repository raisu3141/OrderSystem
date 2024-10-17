import { useState, useEffect, use } from 'react';
import Head from 'next/head';
import Header from '../../components/header';
import Styles from '../../styles/orderInput.module.css';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { StoreList, CartItem, Product } from '../../lib/types';
import Cart from '../../components/orderinput/ProductCart';
import { ProductList } from '../../components/orderinput/ProductList';
import { set } from 'mongoose';
import { useProducts } from '../../hooks/useProducts';

// async function fetchProductList(): Promise<Product[]> {
//   try {
//     const response = await fetch(`/api/Utils/getStoreProductData`);
//     if (!response.ok) {
//       throw new Error('Failed to fetch product list');
//     }
    
//     const data: StoreList[] = await response.json();
//     console.log('Fetched product list:', data); // データを出力して確認

//     // 各商品の productList に storeId を追加
//     const allProducts: Product[] = data.flatMap(store => 
//       store.productList.map(product => ({
//         ...product,
//         storeId: store.storeId // storeId を各商品に追加 (正しいフィールドを参照)
//       }))
//     );

//     console.log('All products:', allProducts); // データを出力して確認

//     return allProducts;
//   } catch (error) {
//     console.error(error);
//     return [];
//   }
// }

export function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  // const [productList, setProductList] = useState<Product[]>([]);
  const productList = useProducts();

  // useEffect(() => {
  //   const loadProducts = async () => {
  //     const products = await fetchProductList();
  //     setProductList(products);
  //   }
  //   loadProducts();
  // }, []);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity } as CartItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== id));
  };

  const quantityChange = (id: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === id ? { ...item, quantity } : item
      )
    );
  };

  return (
    <div>
      <Head>
        <title>注文入力</title>
      </Head>
      <Header />
      <div className={`${Styles.maincontainer} flex`}>
        <ScrollArea className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productList.map((product) => (
              <ProductList key={product.productId} {...product} addToCart={addToCart} />
            ))}
          </div>
        </ScrollArea>
        <Cart cart={cart} onRemove={removeFromCart} onQuantityChange={quantityChange} /> {/* onRemoveを渡す */}
      </div>
    </div>
  );
}

export default OrderPage;
