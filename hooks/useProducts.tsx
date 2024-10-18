import { useState, useEffect } from 'react';
import { Product, StoreList } from '../lib/types';

export const useProducts = () => {
  const [productList, setProductList] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
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
        setProductList(allProducts); // productList を更新
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductList([]); // エラーハンドリング
      }
    };

    fetchProducts(); // データ取得関数を呼び出し
  }, []); // useEffectはコンポーネントがマウントされたときに実行される

  return productList;
};
