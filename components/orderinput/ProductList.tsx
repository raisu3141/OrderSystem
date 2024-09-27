import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Product } from "@/lib/types";

interface ProductListProps extends Product {
  addToCart: (product: Product, quantity: number) => void;
}

export function ProductList({ id, storeId, productName, productImageURL, price, cookTime, stock, addToCart }: ProductListProps) {
  const [quantity, setQuantity] = useState(1);
  const [isOpen, setIsOpen] = useState(false); // ダイアログのオープン状態を管理

  const handleAddToCart = () => {
    addToCart({ id, storeId, productName, productImageURL, price, cookTime, stock }, quantity);
    setQuantity(1); // 数量をリセット
    setIsOpen(false); // ダイアログを閉じる
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white w-full h-auto aspect-square flex flex-col items-center justify-center p-0 ">
          <div className="bg-gray-500 w-full h-48">
            <img
              src={productImageURL}
              alt={productName}
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold">{productName}</h2>
            <h2 className="text-xl font-semibold">￥{price}</h2>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white flex flex-col items-center">
        <img
          src={productImageURL}
          alt={productName}
          className="w-50 h-48 object-contain mb-4"
        />
        <span className="text-left font-semibold w-80">{productName}</span>
        <div className="flex items-center justify-between w-80">
          <span className="text-2xl font-semibold">￥{price}</span>
          <select
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-20 h-10 border rounded-md"
          >
            {Array.from({ length: stock }, (_, index) => (
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
