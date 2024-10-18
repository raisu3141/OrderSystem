import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Product, CartItem, StoreList } from "../../lib/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useProducts } from "../../hooks/useProducts";
import { set } from "mongoose";

async function fetchProductList(): Promise<Product[]> {
  try {
    const response = await fetch(`/api/Utils/getStoreProductData`);
    if (!response.ok) {
      throw new Error('Failed to fetch product list');
    }

    const data: StoreList[] = await response.json();
    console.log('Fetched product list:', data); // データを出力して確認

    // 各商品の productList に storeId を追加
    const allProducts: Product[] = data.flatMap(store => 
      store.productList.map(product => ({
        ...product,
        storeId: store.storeId // storeId を各商品に追加 (正しいフィールドを参照)
      }))
    );

    console.log('All products:', allProducts); // データを出力して確認

    return allProducts;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function ProductList() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProductList();
      setProductList(products);
    }
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
    setQuantity(1);
    setOpenProductId(null);
    console.log('Adding to cart:', product, quantity);
  };

  const productDialog = (product: Product) => (
    <Dialog open={openProductId === product.productId} onOpenChange={() => setOpenProductId(openProductId === product.productId ? null : product.productId)}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white w-full h-auto aspect-square flex flex-col items-center justify-center p-0"
          disabled={product.stock === 0}
          onClick={() => setOpenProductId(product.productId)} // 特定の商品に対してダイアログを開く
        >
          <div className="bg-gray-500 w-full h-48">
            <img
              src={product.productImageUrl}
              alt={product.productName}
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold">{product.productName}</h2>
            <h2 className="text-xl font-semibold">￥{product.price}</h2>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white flex flex-col items-center">
        <VisuallyHidden>
          <DialogTitle>個数入力ダイアログ</DialogTitle>
        </VisuallyHidden>
        <img
          src={product.productImageUrl}
          alt={product.productName}
          className="w-50 h-48 object-contain mb-4"
        />
        <span className="text-left font-semibold w-80">{product.productName}</span>
        <div className="flex items-center justify-between w-80">
          <span className="text-2xl font-semibold">￥{product.price}</span>
          <select
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-20 h-10 border rounded-md"
          >
            {Array.from({ length: product.stock }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => addToCart(product, quantity)}>カートに追加</Button>
      </DialogContent>
    </Dialog>
  );

  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="1">1日目</TabsTrigger>
        <TabsTrigger value="2">2日目</TabsTrigger>
        <TabsTrigger value="3">すべて</TabsTrigger>
      </TabsList>

      <TabsContent value="1">
        <div className="grid grid-cols-3 gap-4">
          {productList.map((product, index) => (
            <div key={index}>{productDialog(product)}</div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="2">Content 2</TabsContent>
      <TabsContent value="3">Content 3</TabsContent>
    </Tabs>
  );
}
