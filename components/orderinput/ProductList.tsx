import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Product } from "../../lib/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import Image from "next/image"; // next/imageをインポート

interface ProductListProps extends Product {
  addToCart: (product: Product, quantity: number) => void;
}

export function ProductList({ addToCart, ...product }: ProductListProps) {
  const [quantity, setQuantity] = useState(1);
  const [isOpen, setIsOpen] = useState(false); // ダイアログのオープン状態を管理

  const handleAddToCart = () => {
    addToCart(product, quantity); // カートに追加
    setQuantity(1); // 数量をリセット
    setIsOpen(false); // ダイアログを閉じる
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white w-full h-auto aspect-square flex flex-col items-center justify-center p-0 "
          disabled={product.stock === 0}
        >
          <div className="bg-gray-500 w-full h-48">
            <img
              src={product.productImageUrl}
              alt={product.productName}
              className="w-full h-48 object-cover"
            />
            {/* <Image
              src={product.productImageUrl}
              alt={product.productName}
              width={192} // 48px * 4 = 192px (w-48相当)
              height={192}
              className="object-cover"
            /> */}
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
        {/* <Image
          src={product.productImageUrl}
          alt={product.productName}
          width={200}
          height={192} // w-50 h-48 相当
          className="object-contain mb-4"
        /> */}
        <span className="text-left font-semibold w-80">{product.productName}</span>
        <div className="flex items-center justify-between w-80">
          <span className="text-2xl font-semibold">￥{product.price}</span>
          <select
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-20 h-10 border rounded-md"
          >
            <option value="" disabled>
              選択してください
            </option>
            {Array.from({ length: product.stock }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleAddToCart}>カートに追加</Button>
      </DialogContent>
    </Dialog>
  );
}
