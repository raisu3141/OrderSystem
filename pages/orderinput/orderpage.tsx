import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../../components/header'
import Styles from '../../styles/Home.module.css'
import ProductCard from '@/components/orderinput/ProductCard'
import { Cart } from '@/components/orderinput/ProductCart'
import { ScrollArea } from '@radix-ui/react-scroll-area'

interface Product {
  id: number,                 // 商品ID
  storeId: number,            // 屋台ID
  productName: string,        // 商品名
  productImageURL: string,    // 商品画像
  price: number,             // 値段
  cookTime: number,          // 調理時間
  stock: number,             // 在庫数
}

export function OrderPage() {
  const [productList, setProductList] = useState<Product[]>([])

  useEffect(() => {
    // APIが出来次第、APIからデータを取得する
    // 以下はモックデータ
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
        productName: "うどん",
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
      {
        id: 6,
        storeId: 105,
        productName: "らむね",
        productImageURL: "/images/ramune.png",
        price: 300,
        cookTime: 5,
        stock: 30,
      },
      {
        id: 6,
        storeId: 105,
        productName: "らむね",
        productImageURL: "/images/ramune.png",
        price: 300,
        cookTime: 5,
        stock: 30,
      },
      {
        id: 6,
        storeId: 105,
        productName: "らむね",
        productImageURL: "/images/ramune.png",
        price: 300,
        cookTime: 5,
        stock: 30,
      },
      {
        id: 6,
        storeId: 105,
        productName: "らむね",
        productImageURL: "/images/ramune.png",
        price: 300,
        cookTime: 5,
        stock: 30,
      },
    ]
    setProductList(mockProductList)
  }, [])

  return (
    <div>
      <Head>
        <title>注文入力</title>
      </Head>
      {/* コンポーネントで作成したヘッダーを使用 */}
      <Header />
      <div className={Styles.container}>
        <div className="flex h-screen">
          <ScrollArea className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {productList.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </ScrollArea>
          <Cart />
        </div>
      </div>
    </div>
  )
}


export default OrderPage;