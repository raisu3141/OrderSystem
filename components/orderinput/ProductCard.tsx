import Link from 'next/link'
import Image from 'next/image'

interface ProductCardProps {
  id: number,                 // 商品ID
  storeId: number,            // 屋台ID
  productName: string,        // 商品名
  productImageURL: string,    // 商品画像
  price: number,             // 値段
  cookTime: number,          // 調理時間
  stock: number,             // 在庫数
}

export function ProductCard({ id, storeId, productName, productImageURL, price, cookTime, stock }: ProductCardProps) {
  return (
    <div className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-30">
      <Image
        src={productImageURL}
        alt={productName}
        width={300}
        height={200}
        className="w-full h-48 object-contain rounded-t-lg"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{productName}</h2>
        <h2 className="text-xl font-semibold">￥{price}</h2>
      </div>
    </div>

  )
}

export default ProductCard;