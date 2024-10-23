import { useState, useEffect } from 'react'
import Header from '../../components/header'
import Styles from '../../styles/Home.module.css'
import Image from 'next/image'
import teststyle from '../../styles/recommend.module.css'

// items インターフェースをAPIレスポンスに合わせて変更
interface items {
  storeName: string;
  productName: string;
  price: number;
  productImageUrl: string;
}

export function pop() {
  // stallDataとしてデータを管理
  const [stallData, setStallData] = useState<items[]>([]);
  const [loading, setLoading] = useState(true);  // ローディング状態を管理

  useEffect(() => {
    fetchRecommendData();
  }, []);

  const fetchRecommendData = async () => {
    try {
      const response = await fetch('/api/Utils/getStoreRecommend', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      console.log(result);  // デバッグ用に取得データをログ出力
      setStallData(result);  // データをステートに保存
      setLoading(false);  // ローディング状態を解除
    } catch (error) {
      console.error('Error fetching stall data:', error);
      setLoading(false);  // エラー時もローディング状態を解除
    }
  };

  if (loading) {
    return <p>Loading...</p>;  // データがロード中の表示
  }

  return (
    <div>
      <div className={Styles.container}>
        {/* APIから取得した屋台一覧を表示 */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {stallData.length > 0 ? (
            stallData.map((src: items, index: number) => {
              return (
                <div className='grid relative' key={index}>
                  <div className={`${teststyle.card} ${index % 4 === 0 ? teststyle.id1 : 
                    index % 4 === 1 ? teststyle.id2 : 
                    index % 4 === 2 ? teststyle.id3 : 
                    index % 4 === 3 ? teststyle.id4 : ''}`}>
                    {/* APIからの画像URLを使用 */}
                    <Image src={src.productImageUrl} height={280} width={280} alt={src.productName} />
                    <div>
                      {/* 店舗名、商品名、価格の表示 */}
                      <div className='font-semibold text-3xl'>{src.storeName}</div>
                      <div className='font-semibold text-4xl'>{src.productName}</div>
                      <div className='font-semibold text-5xl'>&yen;{src.price}</div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <p>No data available</p>  // データがない場合の表示
          )}
        </div>
      </div>
    </div>
  )
}

export default pop;
