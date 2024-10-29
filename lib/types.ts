export interface StoreList {
  storeId: string,
  storeName: string,
  productList: Product[],
  openDay: number,
}

export interface Product {
    productId: string,          // 商品ID
    storeId: string,            // 屋台ID
    productName: string,        // 商品名
    productImageUrl: string,    // 商品画像
    price: number,             // 値段
    stock: number,             // 在庫数
    openDay: number,            // 開催日
}

export interface CartItem extends Product {
    quantity: number
}