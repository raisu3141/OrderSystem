import React, { useEffect, useState } from 'react';
import styles from '/styles/SalesRanking.module.css';
import Sales1st from './Sales1st';
import Sales2nd from './Sales2nd';
import Sales3rd from './Sales3rd';
import axios from 'axios';

function SalesRanking() {
  const [currentTime, setCurrentTime] = useState('');
  const [data, setData] = useState(null); // APIから取得したデータを保存

  // API呼び出し: 商品情報と時刻を取得
  const fetchSalesData = async () => {
    try {
      const response = await axios.get('/api/Utils/getTopSales'); 
      console.log('APIから取得したデータ:', response.data);
      if (response.data && response.data.length > 0) {
        setData(response.data); // 取得したデータをステートに保存
        const now = new Date().toLocaleTimeString(); 
        setCurrentTime(now); // 現在時刻を保存
      } else {
        console.error('データが存在しません');
      }
    } catch (error) {
      console.error('API取得に失敗しました:', error);
    }
  };

  const startAutoRefresh = () => {
    setTimeout(() => {
      fetchSalesData(); // データを取得
      startAutoRefresh(); // 5分ごとに再取得
    }, 5 * 60 * 1000); // 5分 (ミリ秒)
  };

  useEffect(() => {
    fetchSalesData(); // 初回マウント時にAPIからデータ取得
    startAutoRefresh(); // 5分ごとにAPIを再取得するタイマーを開始
  }, []);

  const renderProductRank = (item, index) => {
    switch (item.productRanks) {
      case 1:
        return <Sales1st response={item}  />;
      case 2:
        return <Sales2nd response={item} />;
      case 3:
        return <Sales3rd response={item} />;
      default:
        return <p>{index + 1}位の値は1、2、または3ではありません</p>;
    }
  };
  
  // 画面表示
  return (
    <div className={styles.pagessize}>
      <div className={styles.flex}>
        <span className={styles.container}>売り上げランキング!</span>
        <span className={styles.times}>更新時刻: {currentTime}</span> {/* 時刻表示 */}
      </div>
        {data && data.length > 0 ? (
          <>
            {/* 1位のデータ表示 */}
            <Sales1st response={data[0]} no={0} />
            {/* 2位と3位のデータ表示 */}
            {data.length > 1 && renderProductRank(data[1], 1)} {/* 2位 */}
            {data.length > 2 && renderProductRank(data[2], 2)} {/* 3位 */}
          </>
        ) : (
          <p>データを読み込み中...</p>
        )}
    </div>
  );
}

export default SalesRanking;
