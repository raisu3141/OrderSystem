import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../../components/header';
import Styles from '../../styles/orderInput.module.css';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { CartItem, Product } from '@/lib/types';
import Cart from '@/components/orderinput/ProductCart';
import { ProductList } from '@/components/orderinput/ProductList';

export function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }as CartItem];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const mockProductList: Product[] = [
      {
        id: 1,
        storeId: 101,
        productName: "焼きそば",
        productImageURL: "/images/yakisoba.png",
        price: 600,
        cookTime: 10,
        stock: 20,
      },
      {
        id: 2,
        storeId: 102,
        productName: "たこ焼き",
        productImageURL: "/images/takoyaki.png",
        price: 800,
        cookTime: 15,
        stock: 15,
      },
      {
        id: 3,
        storeId: 103,
        productName: "ホットドッグ",
        productImageURL: "/images/hotdog.png",
        price: 700,
        cookTime: 12,
        stock: 25,
      },
      {
        id: 4,
        storeId: 104,
        productName: "カレーライス",
        productImageURL: "/images/curry.png",
        price: 900,
        cookTime: 20,
        stock: 10,
      },
      {
        id: 5,
        storeId: 105,
        productName: "らむね",
        productImageURL: "/images/ramune.png",
        price: 300,
        cookTime: 5,
        stock: 30,
      },
      
    ];
    setProductList(mockProductList);
  }, []);

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
              <ProductList key={product.id} {...product} addToCart={addToCart} />
            ))}
          </div>
        </ScrollArea>
        <Cart cart={cart}/>
      </div>
    </div>
  );
}

export default OrderPage;
