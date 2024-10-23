import { useState, useEffect } from 'react';
import Styles from '../../styles/Home.module.css';
import Image from 'next/image';

// items インターフェースをAPIレスポンスに合わせて変更
interface items {
  storeName: string;
  productName: string;
  price: number;
  productImageUrl: string;
}

export function Pop() {
  const [stallData, setStallData] = useState<items[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);  // 大きく表示する屋台のインデックス

  useEffect(() => {
    fetchRecommendData();

    const activeIntervalId = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % stallData.length);  // インデックスを次に進める
    }, 5000); // 5秒ごとに変更

    const fetchIntervalId = setInterval(() => {
      fetchRecommendData();
    }, 10000); // 10秒ごとに変更

    return () => {
      clearInterval(activeIntervalId);
      clearInterval(fetchIntervalId);
    };  
  }, [stallData.length]);

  const fetchRecommendData = async () => {
    try {
      const response = await fetch('/api/Utils/getStoreRecommend', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      setStallData(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stall data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;  // データがロード中の表示
  }

  return (
    <div className={`${Styles.container} mt-4`}>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {stallData.length > 0 ? (
          stallData.map((src: items, index: number) => {
            const isActive = index === activeIndex;

            return (
              <div
                className={`flex flex-col items-center justify-center relative p-4 bg-white shadow-lg rounded-lg transition-transform duration-500 ease-in-out ${
                  isActive ? 'scale-110 z-10' : 'scale-90'
                } overflow-hidden`}  // overflow-hiddenを追加
                key={index}
                style={{ 
                  transform: isActive ? 'scale(1.1)' : 'scale(0.9)',
                  transition: 'transform 0.5s ease-in-out',  
                }}
              >
                <div className="relative w-full h-60 overflow-hidden rounded-lg">
                  <Image
                    src={src.productImageUrl}
                    layout="fill"  // 画像が親要素にフィットするように設定
                    objectFit="cover"  // アスペクト比を保ちながら表示
                    alt={src.productName}
                    className="rounded-lg transition-transform hover:scale-105 duration-500 ease-in-out"
                  />
                </div>
                <div className="mt-4 text-center">  {/* テキストを中央に配置 */}
                  <div className={`font-semibold ${isActive ? 'text-xl' : 'text-lg'} text-gray-700`}>
                    {src.storeName}
                  </div>
                  <div className={`font-bold ${isActive ? 'text-2xl' : 'text-xl'} text-gray-900 mt-1`}>
                    {src.productName}
                  </div>
                  <div className={`text-${isActive ? '3xl' : '2xl'} text-indigo-600 font-extrabold mt-2`}>
                    &yen;{src.price}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
}

export default Pop;
