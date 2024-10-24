import React, { useEffect, useState } from 'react'; 
import Image from 'next/image'; 
import styles from '/styles/SalesRanking.module.css'; 
import GoldHolizonLine from './GoldHolizonLine.tsx'; 
import SilverHolizonLine from './SilverHolizonLine.tsx'; 
import BronzeHorizontalLine from './BronzeHorizontalLine.tsx'; 
import axios from 'axios'; 
import { useRouter } from 'next/router';  // 追加: useRouterのインポート

 
const initialState = { 
  rankings: [], // ランキングデータを保存する配列 
  currentTime: '', // 現在時刻 
}; 
 
function SalesRanking() { 
  const [state, setState] = useState(initialState); 
  const router = useRouter();  // ページ遷移用のルーター
 
  // API呼び出し: 商品情報と時刻を取得 
  const fetchSalesData = async () => { 
    try { 
      const response = await axios.get('/api/Utils/getTopSales'); // APIのURLを指定 
      const now = new Date().toLocaleTimeString(); // 現在時刻 
      setState({ rankings: response.data.rankings, currentTime: now }); // APIデータと時刻を更新 
    } catch (error) { 
      console.error('API取得に失敗しました:', error); 
    } 
  }; 
 
  useEffect(() => { 
    // 10分ごとのAPI再取得のロジック
    fetchSalesData(); // 初回マウント時にAPIからデータ取得

    const intervalId = setInterval(() => {
      fetchSalesData(); // 10分ごとにAPIを再取得
    }, 10 * 60 * 1000); // 10分間隔
    

    return () => clearInterval(intervalId); // コンポーネントがアンマウントされる際にタイマーをクリーンアップ
  }, []); 

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push('/recommendpage/newpop'); // 60秒後にページ遷移
    }, 60000); // 60秒 = 60000ms

    return () => clearTimeout(timeoutId); // コンポーネントがアンマウントされる際にタイマーをクリア
  }, [router]);
 
  const renderRankingItem = (ranking, index) => {
    // ランキングデータが存在するか確認し、存在しない場合にフォールバックを適用
    if (!ranking) return null;

    return (
      <div className={styles.imageranker} key={index}>
        <Image 
          className={styles.imagecontainer} 
          src={`/images/crown${index + 1}.png`} // 王冠画像のパスを動的に生成 
          alt={`${index + 1}位画像`} 
          width={175} 
          height={175} 
        />
        <div className={styles.rankfontsize}>{index + 1}位</div>
        <Image 
          className={styles.itemscontainer} 
          src={ranking.productImageUrl || '/images/fallback-image-url.jpg'} // 画像URLがない場合フォールバック
          alt={`${index + 1}位の商品画像`} 
          width={175} 
          height={175} 
        />
        <div className={styles.itemmrgin}>{ranking.productName}</div> {/* 商品名表示 */}
        <div className={styles.namesfontmargin}>{ranking.storeName}</div> {/* 屋台名表示 */}
      </div>
    );
  };

  return( 
    <div className={styles.pagessize}> 
      <div className={styles.flex}> 
        <span className={styles.container}>\売り上げランキング/</span> 
        <span className={styles.times}>更新時刻: {state.currentTime}</span> {/* 時刻表示 */} 
      </div> 

      {/* ランキング表示 */}
      {state.rankings.length > 0 && renderRankingItem(state.rankings[0], 0)}
      <GoldHolizonLine /> 
      {state.rankings.length > 1 && renderRankingItem(state.rankings[1], 1)}
      <SilverHolizonLine /> 
      {state.rankings.length > 2 && renderRankingItem(state.rankings[2], 2)}
      <BronzeHorizontalLine /> 
    </div> 
  ); 
} 
 
export default SalesRanking;
