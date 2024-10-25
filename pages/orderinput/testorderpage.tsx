import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../../components/header";
import Styles from "../../styles/orderInput.module.css";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { StoreList, CartItem, Product } from "../../lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import OrderConfirmation from "../../components/orderinput/OrderConfirmation";

async function fetchProductList() {
  try {
    const response = await fetch(`/api/Utils/getStoreProductData`);
    if (!response.ok) throw new Error("Failed to fetch product list");

    const data: StoreList[] = await response.json();

    // 屋台ごとに商品をまとめる
    const storeProductData = data.reduce((result, store) => {
      if (!result[store.storeId]) {
        result[store.storeId] = {
          storeId: store.storeId,
          storeName: store.storeName,
          openDay: store.openDay,
          products: []
        };
      }
      const formattedProducts = store.productList.map(product => ({
        ...product,
        storeId: store.storeId,
        openDay: store.openDay
      }));
      result[store.storeId].products.push(...formattedProducts);
      return result;
    }, {} as Record<string, { storeId: string; storeName: string; openDay: number; products: Product[] }>);

    return storeProductData;
  } catch (error) {
    console.error(error);
    return {};
  }
}

export default function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'0' | '1' | '2'>('0');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [storeProductList, setStoreProductList] = useState<Record<string, { storeId: string; storeName: string; openDay: number; products: Product[] }>>({});

  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProductList();
      setStoreProductList(products);
      setProductList(Object.values(products).flatMap(store => store.products));
      console.log(productList);
    };
    loadProducts();
  }, []);

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

  const onRemove = (id: string) => setCart(prevCart => prevCart.filter(item => item.productId !== id));

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
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
        <Tabs className="flex-1 overflow-auto p-4" value={activeTab} onValueChange={(value) => setActiveTab(value as '0' | '1' | '2')}>
          <TabsList>
            <TabsTrigger value="0" className={`text-lg px-4 py-2 ${activeTab === '0' ? 'border-b-2 border-blue-500' : ''} `}>すべて</TabsTrigger>
            <TabsTrigger value="1" className={`text-lg px-4 py-2 ${activeTab === '1' ? 'border-b-2 border-blue-500' : ''} `}>1日目</TabsTrigger>
            <TabsTrigger value="2" className={`text-lg px-4 py-2 ${activeTab === '2' ? 'border-b-2 border-blue-500' : ''} `}>2日目</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1 overflow-auto p-4">
            {[0, 1, 2].map(day => (
              <TabsContent value={String(day)} key={day}>
                {Object.entries(storeProductList)
                  .filter(([, store]) => day === 0 || store.openDay === day) // すべての場合は0で表示、それ以外は openDay でフィルタリング
                  .map(([stallId, store]) => (
                    <div key={stallId}>
                      <h2 className="text-3xl font-bold mb-5 mt-5">{store.storeName}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {store.products.map((product: Product) => (
                          <Button
                            key={product.productId}
                            variant="outline"
                            className="bg-white w-full h-auto aspect-square flex flex-col items-center justify-center p-0"
                            onClick={() => {
                              setSelectedProduct(product);
                              setDialogOpen(true);
                            }}
                            disabled={product.stock === 0}
                          >
                            <div className="bg-gray-500 w-full h-48">
                              <img src={product.productImageUrl} alt={product.productName} className="w-full h-48 object-cover" />
                            </div>
                            <div className="p-4">
                              <h2 className="text-xl font-semibold">{product.productName}</h2>
                              <h2 className="text-xl font-semibold">￥{product.price}</h2>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>

        {/* カート */}
        <div className={Styles.cartcontainer}>
          <div className={Styles.cart}>
            <h2 className="text-center text-xl font-semibold mb-1 border-b-2">注文内容</h2>
            <ScrollArea className="h-[calc(85%-4rem)] overflow-auto">
              {cart.map(item => (
                <div key={item.productId} className="border-b-2 mb-1">
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
                    <div className="flex flex-col items-end">
                      <Button
                        variant="link"
                        className="text-gray-500 text-xl p-0"
                        onClick={() => onRemove(item.productId)}
                      >×</Button>
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                        className="w-16 h-9 border-b-2 rounded-md"
                      >
                        {Array.from({ length: Math.min(item.stock) }, (_, index) => ( // 最大数量を制限
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
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <OrderConfirmation cart={cart} totalAmount={totalAmount} onRemove={onRemove} onClose={() => setIsOpen(false)} />
      </Dialog>


      {/* 個数入力ダイアログ */}
      {selectedProduct && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white flex flex-col items-center">
            <VisuallyHidden>
              <DialogTitle>個数入力ダイアログ</DialogTitle>
            </VisuallyHidden>
            <img
              src={selectedProduct.productImageUrl}
              alt={selectedProduct.productName}
              className="w-50 h-48 object-contain mb-4"
            />
            <span className="text-left font-semibold w-80">{selectedProduct.productName}</span>
            <div className="flex items-center justify-between w-80">
              <span className="text-2xl font-semibold">￥{selectedProduct.price}</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 h-10 border rounded-md"
              >
                <option value="" disabled>
                  選択してください
                </option>
                {Array.from({ length: selectedProduct.stock }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={() => {
              addToCart(selectedProduct, quantity);
              setDialogOpen(false);
              setQuantity(1);
            }}>カートに追加</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
