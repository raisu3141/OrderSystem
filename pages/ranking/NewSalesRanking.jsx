import React, { useEffect, useState } from 'react'; 
import Image from 'next/image'; 
import styles from '/styles/newSalesRanking.module.css'; 
import axios from 'axios'; 
import { useRouter } from 'next/router';  // 追加: useRouterのインポート


const initialState = { 
  rankings: [], // ランキングデータを保存する配列 
  currentTime: '', // 現在時刻 
}; 

function SalesRanking() { 
  const [state, setState] = useState(initialState); 
  const router = useRouter();  // ページ遷移用のルーター


  const fetchSalesData = async () => { 
    try { 
      const response = await axios.get('/api/Utils/getTopSales'); 
      const now = new Date().toLocaleTimeString(); 
      setState({ rankings: response.data, currentTime: now }); 
    } catch (error) { 
      console.error('API取得に失敗しました:', error); 
    } 
  }; 

  useEffect(() => { 
    fetchSalesData(); 
  }, []); 


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push('/recommendpage/newpop'); // 60秒後にページ遷移
    }, 5 * 60 * 1000); // 60秒 = 60000ms

    return () => clearTimeout(timeoutId); // コンポーネントがアンマウントされる際にタイマーをクリア
  }, [router]);

  const renderRankingItem = (ranking, index) => {
    if (!ranking) return null;

    return (
      <div className={styles.rankingItem} key={index}>
        <Image 
          className={styles.crownImage} 
          src={`/images/crown${index + 1}.png`} 
          alt={`${index + 1}位画像`} 
          width={100} 
          height={100} 
        />
        <div className={styles.rank}>{index + 1}位</div>
        <Image 
          className={styles.productImage} 
          src={ranking.productImageUrl || 'fallback-image-url.jpg'} 
          alt={`${index + 1}位の商品画像`} 
          width={250} 
          height={250} 
        />
        <div className={styles.productName}>{ranking.productName}</div>
        <div className={styles.storeName}>{ranking.storeName}</div>
      </div>
    );
  };

  return( 
    <div className={styles.pageContainer}> 
      <div className={styles.header}> 
        <span className={styles.title}>売り上げランキング</span> 
        <span className={styles.time}>更新時刻: {state.currentTime}</span> 
      </div> 

      {/* ランキング表示 */}
      <div className={styles.rankingContainer}>
        {state.rankings.map((ranking, index) => (
          <React.Fragment key={index}>
            {renderRankingItem(ranking, index)}
            {index < state.rankings.length - 1 && <div className={styles.divider}></div>}
          </React.Fragment>
        ))}
      </div>
    </div> 
  ); 
} 

export default SalesRanking;
